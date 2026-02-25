import { Request, Response } from "express";
import { refreshCreditReportService } from "./creditReport.service.js";
import { getCreditProvider } from "./creditProvider.factory.js";
import { prisma } from "../../db/prismaService.js";
import { buildCreditReportSearch } from "../../common/utils/search.js";

const creditProvider = getCreditProvider();

export const refreshCreditReportController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { customerId } = req.params;
    const q =
      req.query.q?.toString() ||
      (typeof req.body?.q === "string" ? req.body.q : undefined);
    const { reason } = req.body;
    if (!reason) {
      return res
        .status(400)
        .json({ message: "Reason for refreshing credit report is required" });
    }
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      if (!q) {
        return res
          .status(400)
          .json({ message: "Customer ID or search query is required" });
      }
      const existingReport = await prisma.creditReport.findFirst({
        where: {
          isValid: true,
          ...buildCreditReportSearch(q),
        },
        orderBy: { createdAt: "desc" },
        select: { customerId: true },
      });
      if (!existingReport) {
        return res
          .status(404)
          .json({ message: "No credit report found for the search query" });
      }
      resolvedCustomerId = existingReport.customerId;
    }
    const creditProviderservice = creditProvider;
    const report = await refreshCreditReportService(
      { customerId: resolvedCustomerId, q },
      creditProviderservice,
      {
        requestedBy: req.user.id,
        reason,
        branchId: req.user.branchId,
      },
    );

    res.status(200).json({
      success: true,
      message: "Credit report refreshed successfully",
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
