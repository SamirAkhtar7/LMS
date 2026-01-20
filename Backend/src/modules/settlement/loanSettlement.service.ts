import { prisma } from "../../db/prismaService.js";
import { PaymentMode as PrismaPaymentMode } from "../../../generated/prisma-client/enums.js";

export const settleLoanService = async (
  recoveryId: string,

  data: {
    settlementAmount: number;
    paymentMode: PrismaPaymentMode;
    remarks?: string;
  }
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
        "Settlement has already been processed for this recovery"
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
        recoveryStatus: "RESOLVED", // Use valid enum value
        recoveryStage: "SETTLEMENT",
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



export const applyForSettlementService = async (
  recoveryId: string,
  userId: string,
  data: {
    proposedAmount: number;
    reason: string;
  }
) => {
  const recovery = await prisma.loanRecovery.findUnique({
    where: { id: recoveryId },
    include: { loanApplication: true },
  });

  if (!recovery) throw new Error("Recovery not found");

  if (recovery.loanApplication.status !== "defaulted") {
    throw new Error("Settlement allowed only for defaulted loans");
  }

  return prisma.loanRecovery.update({
    where: { id: recoveryId },
    data: {
      settlementStatus: "APPLIED",
      proposedSettlementAmount: data.proposedAmount,
      remarks: data.reason,
    },
  });
};


