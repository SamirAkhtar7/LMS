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
    let commissionAmount = 0;

    if (partner.commissionType === "PERCENTAGE") {
      commissionAmount =
        ((loan.approvedAmount ?? 0) * (partner.commissionValue ?? 0)) / 100;
    } else {
      commissionAmount = partner.commissionValue ?? 0;
    }

    /* 3️⃣ Idempotent check */
    const existing = await tx.partnerCommission.findFirst({
      where: { loanId },
    });

    let commission;

    if (existing) {
      // Update commission if loan edited
      commission = await tx.partnerCommission.update({
        where: { id: existing.id },
        data: {
          approvedAmount: loan.approvedAmount ?? 0,
          commissionAmount,
          commissionValue: partner.commissionValue ?? 0,
        },
      });
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
