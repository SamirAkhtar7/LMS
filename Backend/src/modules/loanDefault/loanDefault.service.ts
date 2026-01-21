import { prisma } from "../../db/prismaService.js";

export const checkAndMarkLoanDefault = async (loanId: string) => {
  const data = await prisma.$transaction(async (tx) => {
    const loan = await tx.loanApplication.findUnique({
      where: {
        id: loanId,
      },
    });

    if (!loan || loan.status !== "active") {
      throw new Error("Loan application not found");
    }

    const overdueEmis = await tx.loanEmiSchedule.findMany({
      where: {
        loanApplicationId: loanId,
        status: "overdue",
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    if (overdueEmis.length === 0) {
      return { isDefaulted: false };
    }

    const firstOverdueEmi = overdueEmis[0];
    const dpd = Math.floor(
      (Date.now() - firstOverdueEmi.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    //default condition

    if (dpd < 90 && overdueEmis.length < 3) {
      await tx.loanApplication.update({
        where: {
          id: loanId,
        },
        data: {
          status: "delinquent",
          dpd: dpd,
        },
      });

     return { status: "Delinquent", dpd: dpd };
    }

    const outstanding = overdueEmis.reduce(
      (sum, e) =>
        sum + Number(e.principalAmount + e.interestAmount + e.latePaymentFee),
      0
    );
    await tx.loanApplication.update({
      where: {
        id: loanId,
      },
      data: {
        status: "defaulted",
        defaultedAt: new Date(),
        dpd: dpd,
      },
    });

    await tx.loanRecovery.create({
      data: {
        loanApplicationId: loanId,
        customerId: loan.customerId,
        totalOutstandingAmount: outstanding, // Fixed typo: tolalOutstandingAmount -> totalOutstandingAmount
        recoveredAmount: 0,
        balanceAmount: outstanding,
        dpd,
        defaultedAt: new Date(),
        recoveryStage: "INITIAL_CONTACT",
        recoveryStatus: "ONGOING",
      },
    });
    return { status: "Defaulted", dpd: dpd, outstandingAmount: outstanding };
  });

  return data;
};



export const getAllDefaultedLoansService = async () => {

    const loans = await prisma.loanApplication.findMany({
        where: { status: "defaulted" },
        orderBy: {
            defaultedAt: "desc"
        }, 
        include: {
            customer: true,
            loanRecoveries: {
                include: {
                    recoveryPayments: true
                }
            }
        }
    });

    return loans;


}



export const getDefaultLoanByIdService = async (loanId: string) => {
    const loan = await prisma.loanApplication.findUnique({
        where: { id: loanId },
        include: {
            customer: true,
            loanRecoveries: {
                include: {
                    recoveryPayments: true
                }
            }
        }
    })
    if (!loan || loan.status !== "defaulted") {
        throw new Error("Defaulted loan not found");
    }
    return loan;
}

