import { prisma } from "../../db/prismaService.js";
import { logAction } from "../../audit/audit.helper.js";

const handleDebitFailure = async (
  tx: any,
  mandate: any,
  emi: any,
  debitId: string,
  branchId: string,
) => {
  const updateMandate = await tx.nachMandate.update({
    where: { id: mandate.id },
    data: {
      failureCount: { increment: 1 },
    },
  });

  await tx.loanEmiSchedule.update({
    where: { id: emi.id },
    data: { bounceCharges: emi.bounceCharges ?? 0 },
  });

  if (updateMandate.failureCount >= 3) {
    await tx.nachMandate.update({
      where: { id: mandate.id },
      data: {
        status: "SUSPENDED",
      },
    });
  }

  await logAction({
    entityType: "EMI_SCHEDULE",
    entityId: debitId,
    action: "GENERATE_EMI_SCHEDULE",
    performedBy: "SYSTEM",
    branchId: branchId,
    oldValue: null,
    newValue: {
      emiId: emi.id,
      failureCount: updateMandate.failureCount,
    },
  });
};

const simulateBankResponse = (): boolean => {
  return Math.random() > 0.2; // 80% success rate for simulation
};

export const processNachAutoDebit = async () => {
  const today = new Date();
  today.setUTCHours(23, 59, 59, 999); // Set to end of day UTC to capture all EMIs due today
  console.log("Starting NACH auto-debit process for", today.toISOString());
  const dueEmis = await prisma.loanEmiSchedule.findMany({
    where: {
      status: "pending",
      dueDate: { lte: today },
      loanApplication: {
        status: "active",
      },
    },
    include: {
      loanApplication: true,
    },
  });

  console.log(`Found ${dueEmis.length} EMIs due for auto-debit`);

  for (const emi of dueEmis) {
    try {
      await prisma.$transaction(async (tx) => {
        // Fetch active mandate within transaction for consistency
        const mandate = await tx.nachMandate.findFirst({
          where: {
            loanApplicationId: emi.loanApplicationId,
            status: "ACTIVE",
          },
        });

        if (!mandate) {
          console.log(
            `No active mandate for loan application ${emi.loanApplicationId}`,
          );
          return;
        }

        const existingDebit = await tx.nachDebit.findFirst({
          where: {
            emiId: emi.id,
            status: "SUCCESS",
          },
        });

        if (existingDebit) {
          console.log(`EMI ${emi.id} already debited successfully`);
          return;
        }
        const isSuccess = simulateBankResponse();
        const debit = await tx.nachDebit.create({
          data: {
            mandateId: mandate.id,
            emiId: emi.id,
            debitAmount: emi.emiAmount,
            debitDate: new Date(),
            status: isSuccess ? "SUCCESS" : "FAILED",
          },
        });
        if (isSuccess) {
          await tx.loanEmiSchedule.update({
            where: { id: emi.id },
            data: {
              status: "paid",
              paidDate: new Date(),
            },
          });
          await tx.nachMandate.update({
            where: { id: mandate.id },
            data: {
              failureCount: 0,
              lastDebitDate: new Date(),
            },
          });
          await logAction({
            entityType: "EMI_SCHEDULE",
            entityId: debit.id,
            action: "GENERATE_EMI_SCHEDULE",
            performedBy: "SYSTEM",
            branchId: emi.loanApplication.branchId,
            oldValue: null,
            newValue: { emiId: emi.id, amount: emi.emiAmount },
          });
          console.log(`EMI ${emi.id} debited successfully`);
        } else {
          await handleDebitFailure(
            tx,
            mandate,
            emi,
            debit.id,
            emi.loanApplication.branchId,
          );
          console.log(`EMI ${emi.id} debit failed - failure count updated`);
        }
      });
    } catch (error: any) {
      console.error(`Error processing EMI ${emi.id}:`, error.message);
    }
  }
  console.log(
    "NACH auto-debit process completed for",
    new Date().toDateString(),
  );
};
