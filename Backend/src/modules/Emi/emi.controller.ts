import { Request, Response } from "express";
import { prisma } from "../../db/prismaService.js";
import { generateEmiScheduleService } from "../../common/utils/emi.util.js";

export const generateEmiScheduleController = async (
  req: Request,
  res: Response
) => {
  try {
    const loanId = req.params.id;
    const loan = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Loan not found" });

    const schedule = await generateEmiScheduleService({
      loanId: loan.id,
      principal: loan.approvedAmount ?? loan.requestedAmount,
      annualRate: loan.interestRate ?? 0,
      tenureMonths: loan.tenureMonths ?? 0,
      emiAmount: loan.emiAmount ?? 0,
      startDate: new Date(),
    });

    // create records — cast to any to avoid type issues if client not yet generated
    await (prisma as any).loanEmiSchedule.createMany({ data: schedule });

    res.status(200).json({ success: true, data: schedule });
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to generate EMI schedule",
      });
  }
};

export const getLoanEmiController = async (req: Request, res: Response) => {
  try {
    const loanId = req.params.id;
    const emis = await (prisma as any).loanEmiSchedule.findMany({
      where: { loanApplicationId: loanId },
    });
    res.status(200).json({ success: true, data: emis });
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to fetch EMI schedule",
      });
  }
};

export const markEmiPaidController = async (req: Request, res: Response) => {
  try {
    const emiId = req.params.emiId;
    const emi = await (prisma as any).loanEmiSchedule.update({
      where: { id: emiId },
      data: { status: "paid", paidDate: new Date() },
    });

    res.status(200).json({ success: true, data: emi });
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to mark EMI as paid",
      });
  }
};

