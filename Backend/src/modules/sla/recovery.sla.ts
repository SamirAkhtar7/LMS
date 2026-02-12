import { logAction } from "../../audit/audit.helper.js";
import logger from "../../common/logger.js";
import { prisma } from "../../db/prismaService.js";
export const checkRecoverySLA = async () => {
  // 48 hours threshold for SLA breach detection
  const thresholdHours = 48;
  const cutoffDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

  const stuckRecoveries = await prisma.loanRecovery.findMany({
    where: {
      recoveryStage: "INITIAL_CONTACT",
      updatedAt: {
        lt: cutoffDate,
      },
    },
    include: { loanApplication: true },
  });

  for (const rec of stuckRecoveries) {
    await prisma.$transaction(async (prisma) => {
      const exists = await prisma.sLABreachLog.findFirst({
        where: {
          entityType: "RECOVERY",
          entityId: rec.id,
          stage: "INITIAL_CONTACT",
        },
      });
      if (!exists) {
        const branchId = rec.loanApplication?.branchId;
        if (!branchId) {
          logger.error(
            `Loan Application missing for Recovery ID: ${rec.id}. Skipping SLA breach log creation.`,
          );
          return;
        }
        await prisma.sLABreachLog.create({
          data: {
            entityType: "RECOVERY",
            entityId: rec.id,
            stage: "INITIAL_CONTACT",
            breachedAt: new Date(),
            escalatedTo: "BREACH_ADMIN",
            remarks:
              "Recovery stuck in INITIAL_CONTACT for more than 48 hours. Needs urgent attention.",
            branchId: branchId,
          },
        });
        await logAction({
          entityId: rec.id,
          entityType: "RECOVERY",
          action: "SLA_BREACH",
          performedBy: "SYSTEM",
          branchId: branchId,
          remarks:
            "Recovery stuck in INITIAL_CONTACT for more than 48 hours. Needs urgent attention.",
        });

        console.log(`Logged SLA breach for Recovery ID: ${rec.id}`);
      }
    });
  }
};
