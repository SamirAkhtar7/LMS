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

    const q =
      req.query.q?.toString() ||
      (typeof req.body?.q === "string" ? req.body.q : undefined);

    const { reason } = req.body;

    if (!q) {
      return res.status(400).json({
        message: "Search query (q) is required",
      });
    }

    if (!reason) {
      return res.status(400).json({
        message: "Reason for refreshing credit report is required",
      });
    }

    // ✅ Search CUSTOMER by customer fields OR via loan application
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { panNumber: q },
          { aadhaarNumber: q },
          { contactNumber: q },
        ],
      },
      select: { id: true },
    });

    // If not found by customer fields, search by loan number
    if (!customer) {
      const loanApplication = await prisma.loanApplication.findFirst({
        where: { loanNumber: q },
        select: { customerId: true },
      });

      if (loanApplication) {
        customer = { id: loanApplication.customerId };
      }
    }

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found for the search query (PAN, Aadhaar, Contact, or Loan Number)",
      });
    }

    const report = await refreshCreditReportService(
      { customerId: customer.id }, // only customerId
      creditProvider,
      {
        requestedBy: req.user.id,
        reason,
        branchId: req.user.branchId,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Credit report refreshed successfully",
      data: report,
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};