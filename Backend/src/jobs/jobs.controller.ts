import { Request, Response } from "express";

import { processOverdueEmis } from "../modules/Emi/emi.service.js";
import { checkAndMarkLoanDefault } from "../modules/loanDefault/loanDefault.service.js";
import { prisma } from "../db/prismaService.js";


export const processOverdueEmisController = async (
  req: Request,
  res: Response
) => {
  try {
    const count = await processOverdueEmis();
    res.status(200).json({
      success: true,
      message: "Overdue EMI processing completed",
      processedCount: count,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const runLoanDefaultCron = async () => {
  const activeLoans = await prisma.loanApplication.findMany({
    where: { status: "active" },
    select: { id: true },
  });

  for (const loan of activeLoans) {
    await checkAndMarkLoanDefault(loan.id);
  }
};