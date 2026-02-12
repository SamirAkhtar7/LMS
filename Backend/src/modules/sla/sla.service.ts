import { logAction } from "../../audit/audit.helper.js";
import { prisma } from "../../db/prismaService.js";

export const checkKycSLA = async () => {
  const policy = await prisma.sLAPolicy.findFirst({
    where: {
      module: "KYC",
      stage: "kyc_Pending",
    },
    orderBy: { createdAt: "desc" },
  });
  if (!policy) return { message: "No active SLA policy for KYC pending stage" };

  const breachTime = new Date(
    Date.now() - policy.thresholdHours * 60 * 60 * 1000,
    //for testing Only
    // Date.now() - 1 * 60 * 1000, // for testing, set to 1 minute
  );

  const breachKyc = await prisma.kyc.findMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: breachTime,
      },
    },
    include: { loanApplication: true },
  });

  for (const kyc of breachKyc) {
    if (!kyc.loanApplication) continue;

    const loanApplication = kyc.loanApplication;

    await prisma.$transaction(async (prisma) => {
      const exists = await prisma.sLABreachLog.findFirst({
        where: {
          entityType: "KYC",
          entityId: kyc.id,
          stage: "kyc_Pending",
        },
      });

      if (!exists) {
        await prisma.sLABreachLog.create({
          data: {
            entityType: "KYC",
            entityId: kyc.id,
            stage: "kyc_Pending",
            breachedAt: new Date(),
            escalatedTo: "BREACH_ADMIN",
            branchId: loanApplication.branchId,
            remarks: "kyc pending beyond SLA",
          },
        });
        await logAction({
          entityId: kyc.id,
          entityType: "KYC",
          action: "SLA_BREACH",
          performedBy: "SYSTEM",
          branchId: loanApplication.branchId,
          remarks: "kyc pending beyond SLA ",
        });
      }
    });
  }

  return {
    message: "KYC SLA check completed",
    breachesFound: breachKyc.length,
  };
};
