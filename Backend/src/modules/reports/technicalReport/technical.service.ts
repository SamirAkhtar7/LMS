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
        loanApplicationId,
        branchId: loanApplication.branchId,
        ...data,
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
        action: "SUBMITTED",
        performedBy: userId,
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
        id: reportId,
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

export const getAllTechnicalReportsService = async (params: {
  page?: number;
  limit?: number;
  q?: string;
}) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);

  const where = {
    ...buildTechnicalReportSearch(params.q),
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
