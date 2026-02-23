import {prisma} from "../../db/prismaService.js"

export const getSuperAdminDashboardService = async () => {
  const [
    totalLoans,
    activeLoans,
    disbursedLoans,
    defaultedLoans,
    totalDisbursed,
    totalRecovery,
    totalRecovered,
    totalSlaBreaches,
    totalPartners,
    commissionSummary,
  ] = await Promise.all([
    prisma.loanApplication.count(),
    prisma.loanApplication.count({ where: { status: "active" } }),
    prisma.loanApplication.count({ where: { status: "disbursed" } }),
    prisma.loanApplication.count({ where: { status: "defaulted" } }),

    prisma.loanApplication.aggregate({
      _sum: { approvedAmount: true },
      where: { status: "disbursed" },
    }),

    prisma.loanRecovery.count(),

    prisma.recoveryPayment.aggregate({
      _sum: { amount: true },
    }),

    prisma.sLABreachLog.count(),

    prisma.partner.count(),

    prisma.partnerCommission.aggregate({
      _sum: { commissionAmount: true },
    }),
  ]);

  return {
    loans: {
      totalLoans,
      activeLoans,
      disbursedLoans,
      defaultedLoans,
      totalDisbursedAmount: totalDisbursed._sum.approvedAmount ?? 0,
    },
    recovery: {
      totalRecoveryCases: totalRecovery,
      totalRecoveredAmount: totalRecovered._sum.amount ?? 0,
    },
    sla: {
      totalBreaches: totalSlaBreaches,
    },
    partners: {
      totalPartners,
      totalCommission: commissionSummary._sum.commissionAmount ?? 0,
    },
  };
};
