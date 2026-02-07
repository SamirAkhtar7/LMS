import app from "../../../app.js";
import { getAccessibleBranchIds } from "../../../common/utils/branchAccess.js";
import { buildBranchFilter } from "../../../common/utils/branchFilter.js";
import {
  buildPaginationMeta,
  getPagination,
} from "../../../common/utils/pagination.js";
import { buildlegalReportSearch } from "../../../common/utils/search.js";
import { prisma } from "../../../db/prismaService.js";

export const createLegalReportService = async (
  loanApplicationId: string,
  data: any,
  userId: string,
) => {
  return prisma.$transaction(async (tx) => {
    // Fetch loan application to get branchId
    const loanApplication = await tx.loanApplication.findUnique({
      where: { id: loanApplicationId },
      select: { branchId: true },
    });

    if (!loanApplication) {
      throw new Error("Loan application not found");
    }

    const report = await tx.legalReport.create({
      data: {
        loanApplicationId,
        branchId: loanApplication.branchId,
        ...data,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
    await tx.loanApplication.update({
      where: { id: loanApplicationId },
      data: { status: "LEGAL_PENDING" },
    });

    await tx.auditLog.create({
      data: {
        entityType: "LEGAL_REPORT",
        entityId: report.id,
        action: "SUBMITTED",
        performedBy: userId,
      },
    });

    return report;
  });
};

export const approveLegalReportService = async (
  reportId: string,
  approved: string,
) => {
  return prisma.$transaction(async (tx) => {
    const report = await tx.legalReport.update({
      where: { id: reportId },
      data: {
        status: "APPROVED",
        approvedBy: approved,
        approvedAt: new Date(),
      },
    });

    if (report.loanApplicationId) {
      await tx.loanApplication.update({
        where: { id: report.loanApplicationId },
        data: { status: "LEGAL_APPROVED" },
      });
    }
    return report;
  });
};

export const getAllLegalReportsService = async (
  params: {
    page?: number;
    limit?: number;
    q?: string;
  },
  user: {
    id: string;
    role: string;
    branchId: string;
  },
) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);

  const allowedBranchIds = await getAccessibleBranchIds({
    id: user.id,
    role: user.role,
    branchId: user.branchId,
  });

  const where = {
    ...buildlegalReportSearch(params.q),
    ...buildBranchFilter(allowedBranchIds),
  };

  const [data, total] = await prisma.$transaction([
    prisma.legalReport.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.legalReport.count({ where }),
  ]);
  return { data, meta: buildPaginationMeta(total, page, limit) };
};
