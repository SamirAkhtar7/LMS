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
  try {
    // Fetch all active and delinquent loans
    const activeLoans = await prisma.loanApplication.findMany({
      where: { status: { in: ["active", "delinquent"] } },
      select: { id: true },
    });

    let processedCount = 0;
    let failedCount = 0;

    // Process each loan sequentially
    for (const loan of activeLoans) {
      try {
        await checkAndMarkLoanDefault(loan.id);
        processedCount++;
      } catch (error) {
        failedCount++;
        console.error(`Error processing loan ${loan.id}:`, error);
      }
    }

    console.log(
      `Loan default cron completed: ${processedCount} processed, ${failedCount} failed`,
    );

    return { processedCount, failedCount };
  } catch (err) {
    console.error("Error fetching loans:", err);
    return { processedCount: 0, failedCount: 0 };
  }
};
