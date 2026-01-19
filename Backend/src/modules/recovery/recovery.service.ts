import { prisma } from "../../db/prismaService.js";
import { PaymentMode as PrismaPaymentMode } from "../../../generated/prisma-client/enums.js";
import { recovery_stage } from "../../../generated/prisma-client/enums.js";
import { create } from "node:domain";
export const getRecoveryByLoanIdService = async (loanId: string) => {
  const recovery = await prisma.loanRecovery.findFirst({
    where: {
      loanApplicationId: loanId,
    },
  });

  return recovery;
};

export const payRecoveryAmountService = async (
  recoveryId: string,
  amount: number,
  paymentMode: PrismaPaymentMode,
  referenceNo?: string
) => {
  return prisma.$transaction(async (tx) => {
    const recovery = await tx.loanRecovery.findUnique({
      where: { id: recoveryId },
    });

    if (!recovery || recovery.recoveryStatus !== "ONGOING") {
      throw new Error("Invalid recovery record");
    }

    if (amount > recovery.totalOutstandingAmount) {
      throw new Error("Payment exceeds outstanding amount");
    }
    await tx.recoveryPayment.create({
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
      0
    );
    const updatatedRecovery = await tx.loanRecovery.update({
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

    return updatatedRecovery;
  });
};

export const assignRecoveryAgentService = async (
  recoveryId: string,
  assignedTo: string
) => {
  return prisma.loanRecovery.update({
    where: { id: recoveryId },
    data: { assignedTo: assignedTo },
  });
};

export const updatateRecoveryStageService = async (
  recoveryId: string,
  recoveryStage: recovery_stage,
  remarks?: string
) => {
  return prisma.loanRecovery.update({
    where: { id: recoveryId },
    data: {
      recoveryStage: recoveryStage as recovery_stage,
      remarks,
    },
  });
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

export const getAllRecoveriesService = async () => {
  const recoveries = await prisma.loanRecovery.findMany({
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
  const recoveries = await prisma.loanRecovery.findMany({
    where: { assignedTo: agentId },
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

export const getRecoveryDashboardService = async () => {
  const recoveries = await prisma.loanRecovery.findMany({
    where: {
      recoveryStatus: "ONGOING",
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

    lastPayment:
      r.recoveryPayments.length > 0
        ? r.recoveryPayments[r.recoveryPayments.length - 1]
        : null,
    createdAt: r.createdAt,
  }));
};
