import { prisma } from "../../db/prismaService.js";
  import {
  PaymentMode,
  PaymentMode as PrismaPaymentMode,
  recovery_stage,
  recovery_status,
} from "../../../generated/prisma-client/enums.js";
import { getPagination } from "../../common/utils/pagination.js";
import { buildRecoverySearch } from "../../common/utils/search.js";

export const settleLoanService = async (
  recoveryId: string,

  data: {
    settlementAmount: number;
    paymentMode: PrismaPaymentMode;
    remarks?: string;
  },
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

    await tx.recoveryPayment.create({
      data: {
        loanRecoveryId: recoveryId,
        amount: data.settlementAmount,
        paymentDate: new Date(),
        paymentMode: data.paymentMode,
      },
    });

    await tx.loanRecovery.update({
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
    return {
      message: "Loan settlement processed successfully",
    };
  });
};

export const applySettlementService = async (
  recoveryId: string,
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

  return prisma.loanRecovery.update({
    where: {
      id: recoveryId,
    },
    data: {
      recoveryStatus: recovery_status.IN_PROGRESS as any,
      remarks: remarks,
    },
  });
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
    await tx.loanRecovery.update({
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
  });
};

export const paySettlementService = async (
  recoveryId: string,
  amount: number,
  paymentMode: PaymentMode,
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
    await tx.recoveryPayment.create({
      data: {
        loanRecoveryId: recoveryId,
        amount: amount,
        paymentDate: new Date(),
        paymentMode: paymentMode,
        referenceNo: referenceNo,
      },
    });
    await tx.loanRecovery.update({
      where: {
        id: recoveryId,
      },
      data: {
        recoveryAmount: recovery.recoveredAmount + amount,
        balanceAmount: 0,
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
    return {
      message: "Settlement processed successfully",
    };
  });
};

export const rejectSettlementService = async (
  recoveryId: string,
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
  if (recovery.recoveryStatus !== "IN_PROGRESS") {
    throw new Error("Settlement is not in progress for this recovery");
  }
  return prisma.loanRecovery.update({
    where: {
      id: recoveryId,
    },
    data: {
      recoveryStatus: "ONGOING",
      remarks: remarks,
    },
  });
};

export const getAllSettlementsService = async (params: {
  page?: number;
  limit?: number;
  q?: string;
}) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const where = {
    recoveryStage: recovery_stage.SETTLEMENT as any,
    ...buildRecoverySearch(params.q),
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
