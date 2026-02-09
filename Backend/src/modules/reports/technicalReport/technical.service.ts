import { buildBranchFilter } from "../../../common/utils/branchFilter.js";
import { getAccessibleBranchIds } from "../../../common/utils/branchAccess.js";
import {
  buildPaginationMeta,
  getPagination,
} from "../../../common/utils/pagination.js";
import { buildTechnicalReportSearch } from "../../../common/utils/search.js";
import { prisma } from "../../../db/prismaService.js";

export const createTechnicalReportService = async (
  loanApplicationId: string,
  data: any,
  userId: string,
) => {
  //TODO : add upload images logic here
  return prisma.$transaction(async (tx) => {
    // Fetch loan application to get branchId
    const loanApplication = await tx.loanApplication.findUnique({
      where: { id: loanApplicationId },
      select: { branchId: true },
    });

    if (!loanApplication) {
      throw new Error("Loan application not found");
    }

    const report = await tx.technicalReport.create({
      data: {
        ...data,
        loanApplicationId,
        branchId: loanApplication.branchId,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    await tx.loanApplication.update({
      where: { id: loanApplicationId },
      data: { status: "TECHNICAL_PENDING" },
    });

    await tx.auditLog.create({
      data: {
        entityType: "TECHNICAL_REPORT",
        entityId: report.id,
        action: "CREATE_TECHNICAL_REPORT",
        performedBy: userId,
        branchId: loanApplication.branchId,
      },
    });

    return report;
  });
};

export const approveTechnicalReportService = async (
  reportId: string,
  approved: string,
) => {
  return prisma.$transaction(async (tx) => {
    const report = await tx.technicalReport.update({
      where: { id: reportId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    await tx.loanApplication.update({
      where: { id: report.loanApplicationId },
      data: { status: "TECHNICAL_APPROVED" },
    });

    return report;
  });
};

export const getAllTechnicalReportsService = async (
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
    ...buildTechnicalReportSearch(params.q),
    ...buildBranchFilter(allowedBranchIds),
  };

  const [total, data] = await prisma.$transaction([
    prisma.technicalReport.count({ where }),
    prisma.technicalReport.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
};
