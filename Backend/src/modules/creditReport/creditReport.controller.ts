import { Request, Response } from "express";
import { refreshCreditReportService } from "./creditReport.service.js";
import { RefreshCreditReportInput } from "./creditReport.schema.js";
import { getCreditProvider } from "./creditProvider.factory.js";

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
    if (!customerId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }
    const { reason } = req.body;
    if (!reason) {
      return res
        .status(400)
        .json({ message: "Reason for refreshing credit report is required" });
    }
    const creditProviderservice = creditProvider;
    const report = await refreshCreditReportService(
      customerId,
      creditProviderservice,
      {
        requestedBy: req.user.id,
        reason,
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
