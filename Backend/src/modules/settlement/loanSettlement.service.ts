import { prisma } from "../../db/prismaService.js";
import {
  PaymentMode,
  PaymentMode as PrismaPaymentMode,
  recovery_stage,
  recovery_status,
} from "../../../generated/prisma-client/enums.js";
import { getPagination } from "../../common/utils/pagination.js";
import { buildRecoverySearch } from "../../common/utils/search.js";
import { logAction } from "../../audit/audit.helper.js";
import { getAccessibleBranchIds } from "../../common/utils/branchAccess.js";
import { buildBranchFilter } from "../../common/utils/branchFilter.js";

export const settleLoanService = async (
  recoveryId: string,

  data: {
    settlementAmount: number;
    paymentMode: PrismaPaymentMode;
    remarks?: string;
  },
  userId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const recovery = await tx.loanRecovery.findUnique({
      where: {
        id: recoveryId,
      },
      include: {
        loanApplication: true,
      },
    });
    if (!recovery) {
      throw new Error("Recovery record not found");
    }
    if (recovery.recoveryStatus !== "ONGOING") {
      throw new Error(
        "Settlement has already been processed for this recovery",
      );
    }

    if (recovery.loanApplication.status !== "defaulted") {
      throw new Error("Loan application is not in defaulted status");
    }

    if (data.settlementAmount > recovery.balanceAmount) {
      throw new Error("Settlement amount exceeds outstanding balance");
    }

    const payment = await tx.recoveryPayment.create({
      data: {
        loanRecoveryId: recoveryId,
        amount: data.settlementAmount,
        paymentDate: new Date(),
        paymentMode: data.paymentMode,
      },
    });

    const updatedRecovery = await tx.loanRecovery.update({
      where: {
        id: recoveryId,
      },
      data: {
        recoveredAmount: recovery.recoveredAmount + data.settlementAmount,
        balanceAmount: recovery.balanceAmount - data.settlementAmount,
        recoveryStatus: recovery_status.RESOLVED as any,
        recoveryStage: recovery_stage.SETTLEMENT as any,
        remarks: data.remarks,
      },
    });

    await tx.loanApplication.update({
      where: {
        id: recovery.loanApplicationId,
      },
      data: {
        status: "closed",
      },
    });

    await logAction({
      entityType: "LOAN_RECOVERY",
      entityId: recoveryId,
      action: "SETTLE_LOAN",
      performedBy: userId,
      branchId: recovery.branchId,
      oldValue: {
        recoveryStatus: recovery.recoveryStatus,
        recoveryStage: recovery.recoveryStage,
        recoveredAmount: recovery.recoveredAmount,
        balanceAmount: recovery.balanceAmount,
      },
      newValue: {
        recoveryStatus: recovery_status.RESOLVED as any,
        recoveryStage: recovery_stage.SETTLEMENT as any,
        settlementAmount: data.settlementAmount,
        recoveredAmount: updatedRecovery.recoveredAmount,
        balanceAmount: updatedRecovery.balanceAmount,
        paymentMode: data.paymentMode,
        paymentId: payment.id,
      },
      remarks: `Loan settled with payment of ${data.settlementAmount}`,
    });
    return {
      message: "Loan settlement processed successfully",
    };
  });
};

export const applySettlementService = async (
  recoveryId: string,
  userId: string,
  remarks?: string,
) => {
  const recovery = await prisma.loanRecovery.findUnique({
    where: {
      id: recoveryId,
    },
  });
  if (!recovery) {
    throw new Error("Recovery record not found");
  }

  if (recovery.recoveryStatus !== "ONGOING") {
    throw new Error("Settlement has already been processed for this recovery");
  }

  const updatedRecovery = await prisma.loanRecovery.update({
    where: {
      id: recoveryId,
    },
    data: {
      recoveryStatus: recovery_status.IN_PROGRESS as any,
      remarks: remarks,
    },
  });

  await logAction({
    entityType: "LOAN_RECOVERY",
    entityId: recoveryId,
    action: "APPLY_SETTLEMENT",
    performedBy: userId,
    branchId: recovery.branchId,
    oldValue: {
      recoveryStatus: recovery.recoveryStatus,
      remarks: recovery.remarks,
    },
    newValue: {
      recoveryStatus: recovery_status.IN_PROGRESS as any,
      remarks: remarks,
    },
    remarks: "Settlement request applied",
  });

  return updatedRecovery;
};

export const approveSettlementService = async (
  recoveryId: string,
  settlementAmount: number,
  approvedBy: string,
) => {
  return prisma.$transaction(async (tx) => {
    const recovery = await tx.loanRecovery.findUnique({
      where: {
        id: recoveryId,
      },
    });

    if (!recovery) {
      throw new Error("Recovery record not found");
    }

    if (recovery.recoveryStatus !== "IN_PROGRESS") {
      throw new Error("Settlement has not been requested for this recovery");
    }

    if (settlementAmount > recovery.balanceAmount) {
      throw new Error("Settlement amount exceeds outstanding balance");
    }
    const updatedRecovery = await tx.loanRecovery.update({
      where: {
        id: recoveryId,
      },
      data: {
        settlementAmount,
        settlementApprovedBy: approvedBy,
        settlementDate: new Date(),
        recoveryStatus: recovery_status.IN_PROGRESS as any,
        recoveryStage: recovery_stage.SETTLEMENT as any,
      },
    });

    await logAction({
      entityType: "LOAN_RECOVERY",
      entityId: recoveryId,
      action: "APPROVE_SETTLEMENT",
      performedBy: approvedBy,
      branchId: recovery.branchId,
      oldValue: {
        settlementAmount: recovery.settlementAmount,
        settlementApprovedBy: recovery.settlementApprovedBy,
        recoveryStatus: recovery.recoveryStatus,
        recoveryStage: recovery.recoveryStage,
      },
      newValue: {
        settlementAmount: updatedRecovery.settlementAmount,
        settlementApprovedBy: updatedRecovery.settlementApprovedBy,
        recoveryStatus: updatedRecovery.recoveryStatus,
        recoveryStage: updatedRecovery.recoveryStage,
      },
      remarks: `Settlement approved for amount ${settlementAmount}`,
    });
  });
};

export const paySettlementService = async (
  recoveryId: string,
  amount: number,
  paymentMode: PaymentMode,
  userId: string,
  referenceNo?: string,
) => {
  return prisma.$transaction(async (tx) => {
    const recovery = await tx.loanRecovery.findUnique({
      where: {
        id: recoveryId,
      },
    });
    if (!recovery?.settlementAmount) {
      throw new Error("Settlement not approved for this recovery");
    }
    if (amount !== recovery.settlementAmount) {
      throw new Error(
        "Paid amount does not match the approved settlement amount",
      );
    }
    const payment = await tx.recoveryPayment.create({
      data: {
        loanRecoveryId: recoveryId,
        amount: amount,
        paymentDate: new Date(),
        paymentMode: paymentMode,
        referenceNo: referenceNo?.toString() || null,
      },
    });
    const newRecovered = (recovery.recoveredAmount || 0) + amount;
    const newBalance = (recovery.balanceAmount || 0) - amount;

    const updatedRecovery = await tx.loanRecovery.update({
      where: {
        id: recoveryId,
      },
      data: {
        recoveredAmount: newRecovered,
        balanceAmount: newBalance,
        recoveryStatus: recovery_status.SETTLED as any,
        recoveryStage: recovery_stage.SETTLEMENT as any,
      },
    });

    await tx.loanApplication.update({
      where: {
        id: recovery.loanApplicationId,
      },
      data: {
        status: "closed",
      },
    });

    await logAction({
      entityType: "LOAN_RECOVERY",
      entityId: recoveryId,
      action: "PAY_SETTLEMENT",
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
        paymentId: payment.id,
        recoveredAmount: updatedRecovery.recoveredAmount,
        balanceAmount: updatedRecovery.balanceAmount,
        recoveryStatus: updatedRecovery.recoveryStatus,
      },
      remarks: `Settlement payment of ${amount} recorded`,
    });

    return {
      message: "Settlement processed successfully",
      totalOutstandingAmount: newBalance,
      recoveredAmount: newRecovered,
    };
  });
};

export const rejectSettlementService = async (
  recoveryId: string,
  userId: string,
  remarks?: string,
) => {
  const recovery = await prisma.loanRecovery.findUnique({
    where: {
      id: recoveryId,
    },
  });
  if (!recovery) {
    throw new Error("Recovery record not found");
  }
  // if settlement already approved (approved amount set or already settled), reject
  if (
    recovery.settlementAmount ||
    recovery.recoveryStatus === (recovery_status.SETTLED as any)
  ) {
    throw new Error("Loan settlement already approved");
  }
  if (recovery.recoveryStatus !== "IN_PROGRESS") {
    throw new Error("Settlement is not in progress for this recovery");
  }
  const updatedRecovery = await prisma.loanRecovery.update({
    where: {
      id: recoveryId,
    },
    data: {
      recoveryStatus: "ONGOING",
      remarks: remarks,
    },
  });

  await logAction({
    entityType: "LOAN_RECOVERY",
    entityId: recoveryId,
    action: "REJECT_SETTLEMENT",
    performedBy: userId,
    branchId: recovery.branchId,
    oldValue: {
      recoveryStatus: recovery.recoveryStatus,
      remarks: recovery.remarks,
    },
    newValue: {
      recoveryStatus: "ONGOING",
      remarks: remarks,
    },
    remarks: "Settlement request rejected",
  });

  return updatedRecovery;
};

export const getAllSettlementsService = async (params: {
  page?: number;
  limit?: number;
  q?: string;
}, user: {
  id: string;
  role: string;
  branchId: string;

}) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const accessibleBranches = await getAccessibleBranchIds({id: user.id, role: user.role, branchId: user.branchId});
  const where = {
    recoveryStage: recovery_stage.SETTLEMENT as any,
    ...buildRecoverySearch(params.q),
    ...buildBranchFilter(accessibleBranches),
  };
  const [data, total] = await Promise.all([
    prisma.loanRecovery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        loanApplication: true,
        recoveryPayments: true,
      },
    }),
    prisma.loanRecovery.count({ where }),
  ]);
  return {
    data,
    total,
    page,
    limit,
  };
};

export const getSettlementByIdService = async (recoveryId: string) => {
  const settlement = await prisma.loanRecovery.findUnique({
    where: {
      id: recoveryId,
    },
    include: {
      loanApplication: true,
      recoveryPayments: true,
    },
  });
  if (!settlement || settlement.recoveryStage !== "SETTLEMENT") {
    throw new Error("Settlement record not found");
  }
  return settlement;
};

export const getSettlementsByLoanIdService = async (loanId: string) => {
  const settlements = await prisma.loanRecovery.findMany({
    where: {
      loanApplicationId: loanId,
      recoveryStage: recovery_stage.SETTLEMENT as any,
    },
    include: {
      loanApplication: true,
      recoveryPayments: true,
    },
  });
  return settlements;
};

export const getPendingSettlementsService = async () => {
  const settlements = await prisma.loanRecovery.findMany({
    where: {
      recoveryStage: recovery_stage.SETTLEMENT as any,
      recoveryStatus: recovery_status.IN_PROGRESS as any,
    },
    include: {
      loanApplication: true,
      recoveryPayments: true,
    },
  });
  return settlements;
};

export const getCompletedSettlementsService = async () => {
  const settlements = await prisma.loanRecovery.findMany({
    where: {
      recoveryStage: recovery_stage.SETTLEMENT as any,
      recoveryStatus: recovery_status.SETTLED as any,
    },
    include: {
      loanApplication: true,
      recoveryPayments: true,
    },
  });
  return settlements;
};

export const getRejectedSettlementsService = async () => {
  const settlements = await prisma.loanRecovery.findMany({
    where: {
      recoveryStage: recovery_stage.SETTLEMENT as any,
      recoveryStatus: recovery_status.ONGOING as any,
    },
    include: {
      loanApplication: true,
      recoveryPayments: true,
    },
  });
  return settlements;
};

export const getSettlementDashboardService = async () => {
  const settlements = await prisma.loanRecovery.findMany({
    where: {
      recoveryStage: recovery_stage.SETTLEMENT as any,
    },
    include: {
      loanApplication: true,
      recoveryPayments: true,
    },
  });
  return settlements;
};

export const getPayableAmountService = async (recoveryId: string) => {
  const recovery = await prisma.loanRecovery.findUnique({
    where: {
      id: recoveryId,
    },
  });
  if (!recovery) {
    throw new Error("Recovery record not found");
  }
  return {
    balanceAmount: recovery.balanceAmount,
    settlementAmount: recovery.settlementAmount || recovery.balanceAmount,
  };
};
