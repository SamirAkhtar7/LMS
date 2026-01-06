import { prisma } from "../../db/prismaService.js";
import { calculateEmi } from "../../common/utils/emi.util.js";
import {
  EmiScheduleItem,
  EmiScheduleInput,
} from "../LoanApplication/loanApplication.types.js";
import e from "express";

export const generateEmiScheduleService = async (loanId: string) => {
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanId },
  });

  if (
    !loan ||
    !loan.approvedAmount ||
    !loan.interestRate ||
    !loan.tenureMonths ||
    loan.status !== "approved"
  ) {
    throw new Error("Invalid loan data for EMI schedule generation");
  }

  const principal = loan.approvedAmount ?? loan.requestedAmount;
  const tenureMonths = loan.tenureMonths!;
  const annualRate = loan.interestRate;
  const monthlyRate = annualRate / 12 / 100;

  const emi = [];

  let balance = principal;
  let emiAmount: number;

  if (loan.interestType === "FLAT") {
    const totalInterest = (principal * annualRate * (tenureMonths / 12)) / 100;
    emiAmount = (principal + totalInterest) / tenureMonths;
  } else {
    emiAmount =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  }

  for (let i = 1; i <= tenureMonths; i++) {
    const interestAmount = balance * monthlyRate;
    const principalAmount = emiAmount - interestAmount;
    const closingBalance = balance - principalAmount;

    emi.push({
      loanApplicationId: loan.id,
      emiNo: i,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + i)),
      openingBalance: Number(balance.toFixed(2)),
      interestAmount: Number(interestAmount.toFixed(2)),
      principalAmount: Number(principalAmount.toFixed(2)),
      emiAmount: Number(emiAmount.toFixed(2)),
      closingBalance:
        closingBalance < 0 ? 0 : Number(closingBalance.toFixed(2)),
    } as EmiScheduleItem);

    balance = closingBalance;
  }

  await prisma.loanEmiSchedule.createMany({
    data: emi,
  });

  return emi;
};

export const getLoanEmiService = async (loanId: string) => {
  try {
    const emis = await prisma.loanEmiSchedule.findMany({
      where: { loanApplicationId: loanId },
      orderBy: { emiNo: "asc" },
    });
    return emis;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch EMI schedule");
  }
};

export const markEmiPaidService = async (emiId: string) => {
  try {
    const emi = await prisma.loanEmiSchedule.findUnique({
      where: { id: emiId },
    });

    if (!emi || emi.status === "paid") {
      throw new Error("Invalid EMI ID or already paid");
    }
    return await prisma.loanEmiSchedule.update({
      where: { id: emiId },
      data: { status: "paid", paidDate: new Date() },
    });
  } catch (error: any) {
    throw new Error(error.message || "Failed to mark EMI as paid");
  }
};
