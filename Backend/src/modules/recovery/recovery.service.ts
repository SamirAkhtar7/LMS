import { prisma } from "../../db/prismaService.js";
import { PaymentMode as PrismaPaymentMode } from "../../../generated/prisma-client/enums.js";
import { recovery_stage } from "../../../generated/prisma-client/enums.js";
import {
  buildRecoverySearch,
  RECOVERY_STATUSES,
} from "../../common/utils/search.js";
import { getPagination } from "../../common/utils/pagination.js";
import { getAccessibleBranchIds } from "../../common/utils/branchAccess.js";
import { buildBranchFilter } from "../../common/utils/branchFilter.js";
import { logAction } from "../../audit/audit.helper.js";

export const getRecoveryByLoanIdService = async (
  loanId: string,
  userId?: string,
) => {
  return prisma.$transaction(async (tx) => {
    /* 1️⃣ Fetch loan */
    const loan = await tx.loanApplication.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        status: true,
        approvedAmount: true,
        customerId: true,
        branchId: true,
        defaultedAt: true,
        dpd: true,
      },
    });

    if (!loan) {
      throw new Error("Loan application not found");
    }

    if (loan.status !== "defaulted") {
      return null;
    }

    /* 2️⃣ Calculate principal paid */
    const paidEmis = await tx.loanEmiSchedule.findMany({
      where: {
        loanApplicationId: loanId,
        status: "paid",
      },
      select: { principalAmount: true },
    });

    const totalPrincipalPaid = paidEmis.reduce(
      (sum, emi) => sum + emi.principalAmount,
      0,
    );

    const correctOutstanding = (loan.approvedAmount ?? 0) - totalPrincipalPaid;

    if (correctOutstanding <= 0) {
      throw new Error("Outstanding amount is zero");
    }

    /* 3️⃣ Check existing recovery */
    const existingRecovery = await tx.loanRecovery.findFirst({
      where: { loanApplicationId: loanId },
      include: { recoveryPayments: true },
    });

    /* 4️⃣ FIX OLD RECOVERY (🔥 THIS IS THE KEY) */
    if (existingRecovery) {
      if (
        Number(existingRecovery.totalOutstandingAmount.toFixed(2)) !==
        Number(correctOutstanding.toFixed(2))
      ) {
        const updatedRecovery = await tx.loanRecovery.update({
          where: { id: existingRecovery.id },
          data: {
            totalOutstandingAmount: Number(correctOutstanding.toFixed(2)),
            balanceAmount: Number(correctOutstanding.toFixed(2)),
            recoveredAmount: 0,
          },
          include: { recoveryPayments: true },
        });

        // Log recovery update
        if (userId) {
          await logAction({
            entityType: "LOAN_RECOVERY",
            entityId: existingRecovery.id,
            action: "UPDATE_RECOVERY_AMOUNT",
            performedBy: userId,
            branchId: loan.branchId,
            oldValue: {
              totalOutstandingAmount: existingRecovery.totalOutstandingAmount,
              balanceAmount: existingRecovery.balanceAmount,
            },
            newValue: {
              totalOutstandingAmount: Number(correctOutstanding.toFixed(2)),
              balanceAmount: Number(correctOutstanding.toFixed(2)),
            },
            remarks: `Recovery amount corrected for loan ${loanId}`,
          });
        }

        return updatedRecovery;
      }

      return existingRecovery;
    }

    /* 5️⃣ Create new recovery */
    const newRecovery = await tx.loanRecovery.create({
      data: {
        loanApplicationId: loan.id,
        customerId: loan.customerId,
        branchId: loan.branchId,
        totalOutstandingAmount: Number(correctOutstanding.toFixed(2)),
        recoveredAmount: 0,
        balanceAmount: Number(correctOutstanding.toFixed(2)),
        dpd: loan.dpd ?? 0,
        defaultedAt: loan.defaultedAt ?? new Date(),
        recoveryStage: "INITIAL_CONTACT",
        recoveryStatus: "ONGOING",
      },
    });

    // Log recovery creation
    if (userId) {
      await logAction({
        entityType: "LOAN_RECOVERY",
        entityId: newRecovery.id,
        action: "CREATE_RECOVERY",
        performedBy: userId,
        branchId: loan.branchId,
        oldValue: null,
        newValue: {
          totalOutstandingAmount: Number(correctOutstanding.toFixed(2)),
          recoveryStage: "INITIAL_CONTACT",
          recoveryStatus: "ONGOING",
          dpd: loan.dpd ?? 0,
        },
        remarks: `Recovery initiated for defaulted loan ${loanId}`,
      });
    }

    return newRecovery;
  });
};

export const payRecoveryAmountService = async (
  recoveryId: string,
  amount: number,
  paymentMode: PrismaPaymentMode,
  userId: string,
  referenceNo?: string,
) => {
  return prisma.$transaction(async (tx) => {
    const recovery = await tx.loanRecovery.findUnique({
      where: { id: recoveryId },
    });

    if (!recovery || recovery.recoveryStatus !== "ONGOING") {
      throw new Error("Invalid recovery record");
    }

    if (amount > recovery.balanceAmount) {
      throw new Error("Payment exceeds outstanding amount");
    }

    const payment = await tx.recoveryPayment.create({
      data: {
        loanRecoveryId: recoveryId,
        amount,
        paymentMode,
        paymentDate: new Date(),
        referenceNo,
      },
    });

    const recoveredAmount = recovery.recoveredAmount + amount;
    const balanceAmount = Math.max(
      recovery.totalOutstandingAmount - recoveredAmount,
      0,
    );
    const updatedRecovery = await tx.loanRecovery.update({
      where: { id: recoveryId },
      data: {
        recoveredAmount: recoveredAmount,
        balanceAmount,

        recoveryStatus: balanceAmount === 0 ? "COMPLETED" : "ONGOING",
        recoveryStage: balanceAmount === 0 ? "CLOSED" : recovery.recoveryStage,
      },
    });

    if (balanceAmount === 0) {
      await tx.loanApplication.update({
        where: {
          id: recovery.loanApplicationId,
        },
        data: {
          status: "closed",
        },
      });
    }

    // Log recovery payment
    await logAction({
      entityType: "RECOVERY_PAYMENT",
      entityId: payment.id,
      action: "RECORD_RECOVERY_PAYMENT",
      performedBy: userId,
      branchId: recovery.branchId,
      oldValue: {
        recoveredAmount: recovery.recoveredAmount,
        balanceAmount: recovery.balanceAmount,
        recoveryStatus: recovery.recoveryStatus,
      },
      newValue: {
        paymentAmount: amount,
        paymentMode,
        recoveredAmount: recoveredAmount,
        balanceAmount: balanceAmount,
        recoveryStatus: balanceAmount === 0 ? "COMPLETED" : "ONGOING",
      },
      remarks:
        balanceAmount === 0
          ? `Recovery completed with payment of ₹${amount}. Total recovered: ₹${recoveredAmount}`
          : `Recovery payment of ₹${amount} recorded. Remaining balance: ₹${balanceAmount}`,
    });

    return updatedRecovery;
  });
};

export const assignRecoveryAgentService = async (
  recoveryId: string,
  assignedTo: string,
  assignedBy: string,
) => {
  const recovery = await prisma.loanRecovery.findUnique({
    where: { id: recoveryId },
  });
  if (!recovery) {
    throw new Error("Recovery record not found");
  }

  const agent = await prisma.employee.findUnique({
    where: { id: assignedTo },
    include: { user: { select: { fullName: true } } },
  });
  if (!agent || agent.branchId !== recovery.branchId) {
    throw new Error(
      "Invalid agent or agent does not belong to the same branch",
    );
  }

  const updatedRecovery = await prisma.loanRecovery.update({
    where: { id: recoveryId },
    data: { assignedTo },
  });

  // Log recovery assignment
  await logAction({
    entityType: "LOAN_RECOVERY",
    entityId: recoveryId,
    action: "ASSIGN_RECOVERY_AGENT",
    performedBy: assignedBy,
    branchId: recovery.branchId,
    oldValue: {
      assignedTo: recovery.assignedTo,
    },
    newValue: {
      assignedTo: assignedTo,
      agentName: agent.user.fullName,
    },
    remarks: recovery.assignedTo
      ? `Recovery reassigned to ${agent.user.fullName}`
      : `Recovery assigned to ${agent.user.fullName}`,
  });

  return updatedRecovery;
};

export const updateRecoveryStageService = async (
  recoveryId: string,
  recoveryStage: recovery_stage,
  userId: string,
  remarks?: string,
) => {
  const existingRecovery = await prisma.loanRecovery.findUnique({
    where: { id: recoveryId },
  });

  if (!existingRecovery) {
    throw new Error("Recovery record not found");
  }

  const updatedRecovery = await prisma.loanRecovery.update({
    where: { id: recoveryId },
    data: {
      recoveryStage,
      remarks,
    },
  });

  // Log recovery stage update
  await logAction({
    entityType: "LOAN_RECOVERY",
    entityId: recoveryId,
    action: "UPDATE_RECOVERY_STAGE",
    performedBy: userId,
    branchId: existingRecovery.branchId,
    oldValue: {
      recoveryStage: existingRecovery.recoveryStage,
      remarks: existingRecovery.remarks,
    },
    newValue: {
      recoveryStage,
      remarks,
    },
    remarks: `Recovery stage updated from ${existingRecovery.recoveryStage} to ${recoveryStage}`,
  });

  return updatedRecovery;
};
export const getLoanWithRecoveryService = async () => {
  const loanWithRecovery = await prisma.loanApplication.findMany({
    where: {
      loanRecoveries: {
        some: {},
      },
    },
    include: {
      customer: true,
      loanRecoveries: {
        include: {
          recoveryPayments: true,
        },
      },
    },
  });
  return loanWithRecovery;
};

export const getAllRecoveriesService = async (
  params: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  },
  user: { id: string; role: string; branchId?: string },
) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const accessibleBranches = await getAccessibleBranchIds(user);
  const where: any = {
    ...buildRecoverySearch(params.q),
    ...buildBranchFilter(accessibleBranches),
  };

  // ✅ SAFE enum filter
  if (params.status && RECOVERY_STATUSES.includes(params.status as any)) {
    where.recoveryStatus = params.status;
  }
  const [data, total] = await Promise.all([
    prisma.loanRecovery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        loanApplication: {
          include: {
            customer: true,
          },
        },
        recoveryPayments: true,
      },
    }),
    prisma.loanRecovery.count({ where }),
  ]);
  return {
    data,
    meta: {
      total,
      page,
      limit,
    },
  };
};

export const getRecoveryDetailsService = async (recoveryId: string) => {
  const recovery = await prisma.loanRecovery.findUnique({
    where: { id: recoveryId },
    include: {
      loanApplication: {
        include: {
          customer: true,
        },
      },
      recoveryPayments: true,
    },
  });
  return recovery;
};
export const getRecoveriesByAgentService = async (agentId: string) => {
  const agent = await prisma.employee.findUnique({
    where: { id: agentId },
  });
  if (!agent) {
    throw new Error("Agent not found");
  }

  const recoveries = await prisma.loanRecovery.findMany({
    where: {
      assignedTo: agentId,
      branchId: agent.branchId,
    },
    include: {
      loanApplication: {
        include: {
          customer: true,
        },
      },
      recoveryPayments: true,
    },
  });
  return recoveries;
};
export const getRecoveriesByStatusService = async (status: string) => {
  const recoveries = await prisma.loanRecovery.findMany({
    where: { recoveryStatus: status as any },
    include: {
      loanApplication: {
        include: {
          customer: true,
        },
      },
      recoveryPayments: true,
    },
  });
  return recoveries;
};

export const getRecoveriesByStageService = async (stage: string) => {
  const recoveries = await prisma.loanRecovery.findMany({
    where: { recoveryStage: stage as any },
    include: {
      loanApplication: {
        include: {
          customer: true,
        },
      },
      recoveryPayments: true,
    },
  });
  return recoveries;
};

export const getRecoveryDashboardService = async (user: {
  id: string;
  role: string;
  branchId?: string;
}) => {
  const accessibleBranches = await getAccessibleBranchIds({
    id: user.id,
    role: user.role,
    branchId: user.branchId,
  });

  const recoveries = await prisma.loanRecovery.findMany({
    where: {
      recoveryStatus: "ONGOING",
      ...buildBranchFilter(accessibleBranches),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      loanApplication: {
        select: {
          id: true,
          loanNumber: true,
          approvedAmount: true,
          status: true,
          dpd: true,
        },
      },
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          contactNumber: true,
        },
      },
      recoveryPayments: {
        orderBy: {
          paymentDate: "desc",
        },
        select: {
          id: true,
          amount: true,
          paymentDate: true,
        },
      },
    },
  });
  return recoveries.map((r) => ({
    recoveryId: r.id,
    loanNumber: r.loanApplication.loanNumber,
    customerName: `${r.customer.firstName} ${r.customer.lastName}`,
    contactNumber: r.customer.contactNumber,
    dpd: r.loanApplication.dpd,
    totalOutstandingAmount: r.totalOutstandingAmount,
    recoveredAmount: r.recoveredAmount,
    balanceAmount: r.balanceAmount,

    recoveryStage: r.recoveryStage,
    recoveryStatus: r.recoveryStatus,
    assignedTo: r.assignedTo,

    lastPayment: r.recoveryPayments.length > 0 ? r.recoveryPayments[0] : null,
    createdAt: r.createdAt,
  }));
};
