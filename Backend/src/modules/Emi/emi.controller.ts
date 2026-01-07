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
    
    if (
      loan.emiAmount === null ||
      loan.emiAmount === undefined ||
      loan.emiAmount <= 0 ||
      loan.interestRate === null ||
      loan.interestRate === undefined ||
      loan.interestRate <= 0 ||
      loan.tenureMonths === null ||
      loan.tenureMonths === undefined ||
      loan.tenureMonths <= 0  
    ) {
      return res
        .status(400)
        .json({ success: false, message: "EMI amount not set for the loan, interest rate, or tenure is invalid" });
    }

    const schedule = await generateEmiScheduleService({
      
      loanId: loan.id,
      principal: loan.approvedAmount ?? loan.requestedAmount,
      annualRate: loan.interestRate,
      tenureMonths: loan.tenureMonths,
      emiAmount: loan.emiAmount,
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
        message: "Failed to generate EMI schedule",
        error: error.message,
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
        message: "Failed to fetch EMI schedule",
        error: error.message,
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
        message: "Failed to mark EMI as paid",
        error: error.message,
      });
  }
};

