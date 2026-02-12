import { logAction } from "../../audit/audit.helper.js";
import { prisma } from "../../db/prismaService.js";

// TODO - Add notification logic to alert assigned employee and branch manager about the breach
// TODO - Consider adding or not
export const checkLoanAssignmentSLA = async () => {
  const threshold = 72; // hours
  const cutoffTime = new Date(Date.now() - threshold * 60 * 60 * 1000);
  const staleLoans = await prisma.loanAssignment.findMany({
    where: {
      assignedAt: {
        lt: cutoffTime,
      },
      isActive: true,
    },
    include: { loanApplication: true },
  });

  for (const loan of staleLoans) {
    await prisma.$transaction(async (prisma) => {
      await prisma.loanAssignment.update({
        where: {
          id: loan.id,
        },
        data: {
          isActive: false,
          unassignedAt: new Date(),
        },
      });

      // prevent duplicate breach logs for the same loan assignment
      const existing = await prisma.sLABreachLog.findFirst({
        where: {
          entityType: "LOAN_ASSIGNMENT",
          entityId: loan.id,
          stage: "ASSIGNED",
        },
      });
      if (!existing) {
        await prisma.sLABreachLog.create({
          data: {
            entityType: "LOAN_ASSIGNMENT",
            entityId: loan.id,
            stage: "ASSIGNED",
            breachedAt: new Date(),
            escalatedTo: "BREACH_ADMIN",
            remarks:
              "Auto-unassigned due to SLA breach of 72 hours without action",
            branchId: loan.loanApplication.branchId,
          },
        });

        await logAction({
          entityId: loan.id,
          entityType: "LOAN_ASSIGNMENT",
          action: "SLA_BREACH_AUTO_UNASSIGN",
          performedBy: "SYSTEM",
          branchId: loan.loanApplication.branchId,
          remarks: "Auto-unassigned after 72 hours",
        });
      }
    });
  }
};
