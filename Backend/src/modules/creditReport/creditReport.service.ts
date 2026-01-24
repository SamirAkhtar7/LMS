import { prisma } from "../../db/prismaService.js";
import { CreditProvider } from "./providers/creditProvider.interface.js";
import { getCreditProvider } from "./creditProvider.factory.js";

const creditProvider = getCreditProvider();


//TODO : Move to config
// Credit report validity duration in days
const CREDIT_REPORT_TTL_DAYS = 30;

export const getOrCreateCreditReport = async (
  provider: CreditProvider,
  customerId: string,
  identifiers: { pan?: string; aadhar?: string },
) => {
  // Check if credit report already exists
  let creditReport = await prisma.creditReport.findFirst({
    where: {
      customerId,
      isValid: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      creditAccount: true,
    },
  });

  if (creditReport) {
    const ageInDays =
      (Date.now() - creditReport.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays <= CREDIT_REPORT_TTL_DAYS) {
      return creditReport;
    }
  }

  // Fetch new credit report from provider
  const report = await provider.fetchCreditReport({
    customerId,
    ...identifiers,
  });

  // Store credit report in database

  let saved;
  try {
    saved = await prisma.creditReport.upsert({
      where: { customerId },
      update: {
        provider: "CIBIL",
        creditScore: report.creditScore,
        totalAtiveLoans: report.totalActiveLoans,
        totalClosedLoans: report.totalClosedLoans,
        totalOutstandingLoans: report.totalOutstanding,
        totalMonthlyEmi: report.totalMonthlyEmi,
        maxDPD: report.maxDPD,
        overdueAccounts: report.overdueAccounts,
        wittenOffCounts: report.writtenOffCount,
        settledCounts: report.settledCount,
        rowRawData: report.rawReport,
        isValid: true,
        creditAccount: {
          deleteMany: {},
          create: report.accounts.map((a) => ({
            lenderName: a.lenderName,
            accountType: a.accountType,
            accountStatus: a.accountStatus,
            sanctionedAmount: a.sanctionedAmount,
            outstanding: a.outstandingAmount,
            emiAmount: a.emiAmount,
            dpd: a.dpd,
           
          })),
        },
      },
      create: {
        customerId,
        provider: "CIBIL",
        creditScore: report.creditScore,
        totalAtiveLoans: report.totalActiveLoans,
        totalClosedLoans: report.totalClosedLoans,
        totalOutstandingLoans: report.totalOutstanding,
        totalMonthlyEmi: report.totalMonthlyEmi,
        maxDPD: report.maxDPD,
        overdueAccounts: report.overdueAccounts,
        wittenOffCounts: report.writtenOffCount,
        settledCounts: report.settledCount,
        rowRawData: report.rawReport,
        isValid: true,
        creditAccount: {
          create: report.accounts.map((a) => ({
            lenderName: a.lenderName,
            accountType: a.accountType,
            accountStatus: a.accountStatus,
            sanctionedAmount: a.sanctionedAmount,
            outstanding: a.outstandingAmount,
            emiAmount: a.emiAmount,
            dpd: a.dpd,
           
          })),
        },
      },
      include: { creditAccount: true },
    });
  } catch (err: any) {
    // Handle unique constraint race (another process created the report)
    if (err?.code === "P2002") {
      const existing = await prisma.creditReport.findFirst({
        where: { customerId, isValid: true },
        include: { creditAccount: true },
        orderBy: { createdAt: "desc" },
      });
      if (existing) return existing;
    }
    throw err;
  }
  return saved;
};

export const refreshCreditReportService = async (
  customerId: string,
  provider: typeof creditProvider,
  meta: {
    requestedBy: string;
    reason: string;
  },
) => {
  await prisma.creditReport.updateMany({
    where: {
      customerId,
      isValid: true,
    },
    data: {
      isValid: false,
      pulledFor: meta.reason,
    },
  });

  // Fetch new report

  const report = await provider.fetchCreditReport({
    customerId,
  });

  let saved;
  try {
    saved = await prisma.creditReport.upsert({
      where: { customerId },
      update: {
        provider: "CIBIL",
        creditScore: report.creditScore,
        totalAtiveLoans: report.totalActiveLoans,
        totalClosedLoans: report.totalClosedLoans,
        totalOutstandingLoans: report.totalOutstanding,
        totalMonthlyEmi: report.totalMonthlyEmi,
        maxDPD: report.maxDPD,
        overdueAccounts: report.overdueAccounts,
        wittenOffCounts: report.writtenOffCount,
        settledCounts: report.settledCount,
        rowRawData: report.rawReport,
        isValid: true,
        creditAccount: {
          deleteMany: {},
          create: report.accounts.map((a) => ({
            lenderName: a.lenderName,
            accountType: a.accountType,
            accountStatus: a.accountStatus,
            sanctionedAmount: a.sanctionedAmount,
            outstanding: a.outstandingAmount,
            emiAmount: a.emiAmount,
            dpd: a.dpd,
         
          })),
        },
      },
      create: {
        customerId,
        provider: "CIBIL",
        creditScore: report.creditScore,
        totalAtiveLoans: report.totalActiveLoans,
        totalClosedLoans: report.totalClosedLoans,
        totalOutstandingLoans: report.totalOutstanding,
        totalMonthlyEmi: report.totalMonthlyEmi,
        maxDPD: report.maxDPD,
        overdueAccounts: report.overdueAccounts,
        wittenOffCounts: report.writtenOffCount,
        settledCounts: report.settledCount,
        rowRawData: report.rawReport,
        isValid: true,
        creditAccount: {
          create: report.accounts.map((a) => ({
            lenderName: a.lenderName,
            accountType: a.accountType,
            accountStatus: a.accountStatus,
            sanctionedAmount: a.sanctionedAmount,
            outstanding: a.outstandingAmount,
            emiAmount: a.emiAmount,
            dpd: a.dpd,
  
          })),
        },
      },
      include: { creditAccount: true },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      const existing = await prisma.creditReport.findFirst({
        where: { customerId, isValid: true },
        include: { creditAccount: true },
        orderBy: { createdAt: "desc" },
      });
      if (existing) return existing;
    }
    throw err;
  }

  // await prisma.auditlog.create({
  //     data: {
  //         entityType: "CREDIT_REPORT",
  //         entityId: saved.id,
  //         action: "MANUAL_REFRESH",
  //         performedBy: meta.requestedBy,
  //         remarks: meta.reason,
  //     }
  // })
  return saved;
};
