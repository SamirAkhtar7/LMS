import { prisma } from "../../db/prismaService.js";
import { logAction } from "../../audit/audit.helper.js";

export const calculatePartnerCommission = async (
  loanId: string,
  performedBy?: string,
) => {
  return prisma.$transaction(async (tx) => {
    /* 1️⃣ Fetch loan */
    const loan = await tx.loanApplication.findUnique({
      where: { id: loanId },
      include: {
        partner: true,
      },
    });

    if (!loan) throw new Error("Loan not found");

    if (loan.status !== "approved") {
      throw new Error("Commission can be calculated only after approval");
    }

    if (!loan.partner) return null;

    const partner = loan.partner;

    /* 2️⃣ Calculate amount */
    let commissionAmountCents = 0;
    const approvedAmountCents = Math.round((loan.approvedAmount ?? 0) * 100);

    if (partner.commissionType === "PERCENTAGE") {
      commissionAmountCents = Math.round(
        (approvedAmountCents * (partner.commissionValue ?? 0)) / 100,
      );
    } else {
      commissionAmountCents = Math.round((partner.commissionValue ?? 0) * 100);
    }
    const commissionAmount = commissionAmountCents / 100;
    /* 3️⃣ Idempotent check */
    const existing = await tx.partnerCommission.findFirst({
      where: { loanId },
    });

    let commission;

    if (existing) {
      // Update commission if loan edited
      const delta = commissionAmount - existing.commissionAmount;

      commission = await tx.partnerCommission.update({
        where: { id: existing.id },
        data: {
          approvedAmount: loan.approvedAmount ?? 0,
          commissionAmount,
          commissionValue: partner.commissionValue ?? 0,
        },
      });

      if (delta !== 0) {
        await tx.partner.update({
          where: { id: partner.id },
          data: {
            commissionEarned: { increment: delta },
          },
        });
      }
    } else {
      commission = await tx.partnerCommission.create({
        data: {
          partnerId: partner.id,
          loanId: loan.id,
          approvedAmount: loan.approvedAmount ?? 0,
          commissionType: partner.commissionType,
          commissionValue: partner.commissionValue ?? 0,
          commissionAmount,
        },
      });

      await tx.partner.update({
        where: { id: partner.id },
        data: {
          commissionEarned: { increment: commissionAmount },
          activeReferrals: { increment: 1 },
        },
      });
    }
    /* 4️⃣ Audit log */
    await logAction({
      entityType: "PARTNER_COMMISSION",
      entityId: commission.id,
      action: existing ? "UPDATE_COMMISSION" : "CREATE_COMMISSION",
      performedBy: performedBy ?? "SYSTEM",
      branchId: loan.branchId,
      oldValue: existing ?? null,
      newValue: commission,
    });

    return commission;
  });
};
