import { prisma } from "../../db/prismaService.js";
import { logAction } from "../../audit/audit.helper.js";
import * as Enums from "../../../generated/prisma-client/enums.js";

export const disburseLoanService = async (
  loanId: string,
  userId: string,
  input: {
    disbursementMode: Enums.DisbursementMode;
    transactionReference: string;
    remarks?: string;
  },
) => {
  // Validate required fields
  if (!input.disbursementMode) {
    throw new Error("Disbursement mode is required");
  }
  if (!input.transactionReference) {
    throw new Error("Transaction reference is required");
  }

  return prisma.$transaction(async (tx) => {
    const loan = await tx.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!loan) {
      const err: any = new Error("Loan application not found");
      err.statusCode = 404;
      throw err;
    }
    if (loan.status !== "approved") {
      throw new Error("Only approved loans can be disbursed");
    }
    if (!loan.approvedAmount) {
      throw new Error("Approved amount not found for this loan");
    }
    const existingDisbursement = await tx.loanDisbursement.findUnique({
      where: { loanId },
    });
    if (existingDisbursement) {
      throw new Error("loan already disbursed");
    }

    const disbursement = await tx.loanDisbursement.create({
      data: {
        loanId,
        amount: loan.approvedAmount,
        disbursementMode: input.disbursementMode,
        transactionReference: input.transactionReference,
        remarks: input.remarks,
        processedBy: userId,
      },
    });
    await tx.loanApplication.update({
      where: { id: loanId },
      data: {
        status: "disbursed",
      },
    });

    await logAction({
      action: "LOAN_DISBURSED",
      entityType: "LOAN_APPLICATION",
      entityId: loanId,
      performedBy: userId,
      branchId: loan.branchId,
      oldValue: {
        status: loan.status,
      },
      newValue: {
        disbursementMode: input.disbursementMode,
        transactionReference: input.transactionReference,
        amount: loan.approvedAmount,
      },
      remarks: `Disbursed via ${input.disbursementMode} `,
    });

    return disbursement;
  });
};
