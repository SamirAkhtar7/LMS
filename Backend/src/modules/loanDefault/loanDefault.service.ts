import { prisma } from "../../db/prismaService.js";

export const checkAndMarkLoanDefault = async (loanId: string) => {
  return prisma.$transaction(async (tx) => {
    const loan = await tx.loanApplication.findUnique({
      where: { id: loanId },
    });

    // ✅ Allow active + delinquent, block only defaulted
    if (!loan || loan.status === "defaulted") {
      return { skipped: true };
    }

    const overdueEmis = await tx.loanEmiSchedule.findMany({
      where: {
        loanApplicationId: loanId,
        status: "overdue",
      },
      orderBy: { dueDate: "asc" },
    });

    if (overdueEmis.length === 0) {
      return { isDefaulted: false };
    }

    const firstOverdueEmi = overdueEmis[0];
    const dpd = Math.floor(
      (Date.now() - firstOverdueEmi.dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const isDefault = overdueEmis.length >= 3 || dpd >= 90;

    // 🔸 DELINQUENT
    if (!isDefault) {
      await tx.loanApplication.update({
        where: { id: loanId },
        data: { status: "delinquent", dpd },
      });

      return { status: "Delinquent", dpd };
    }

    // 🔴 DEFAULT
    const outstanding = overdueEmis.reduce(
      (sum, e) =>
        sum +
        Number(e.principalAmount) +
        Number(e.interestAmount) +
        Number(e.latePaymentFee),
      0,
    );
    await tx.loanApplication.update({
      where: { id: loanId },
      data: {
        status: "defaulted",
        defaultedAt: new Date(),
        dpd,
      },
    });

    await tx.loanRecovery.create({
      data: {
        loanApplicationId: loanId,
        customerId: loan.customerId,
        totalOutstandingAmount: outstanding,
        recoveredAmount: 0,
        branchId: loan.branchId,
        balanceAmount: outstanding,
        dpd,
        defaultedAt: new Date(),
        recoveryStage: "INITIAL_CONTACT",
        recoveryStatus: "ONGOING",
      },
    });

    return { status: "Defaulted", dpd, outstandingAmount: outstanding };
  });
};


//TODO : Add pagination and data filtering based on branch 
export const getAllDefaultedLoansService = async () => {
  const loans = await prisma.loanApplication.findMany({
    where: { status: "defaulted" },
    orderBy: {
      defaultedAt: "desc",
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

  return loans;
};

export const getDefaultLoanByIdService = async (loanId: string) => {
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanId },
    include: {
      customer: true,
      loanRecoveries: {
        include: {
          recoveryPayments: true,
        },
      },
    },
  });
  if (!loan || loan.status !== "defaulted") {
    throw new Error("Defaulted loan not found");
  }
  return loan;
};
