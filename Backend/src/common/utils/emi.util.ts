import { EmiScheduleItem, EmiScheduleInput } from "../../modules/LoanApplication/loanApplication.types.js";

export function calculateEmi({
  principal,
  annualInterestRate,
  tenureMonths,
  interestType,
}: {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
  interestType: "FLAT" | "REDUCING";
}) {
  const monthlyRate = annualInterestRate / 12 / 100;

  let emi = 0;
  let totalPayable = 0;
  if (interestType === "FLAT") {
    totalPayable =
      principal + principal * (annualInterestRate / 100) * (tenureMonths / 12);
    emi = totalPayable / tenureMonths;
  } else {
    emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    totalPayable = emi * tenureMonths;
  }

  return {
    emi: Number(emi.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
  };
}


export const generateEmiScheduleService = async ({
  loanId,
  principal,
  annualRate,
  tenureMonths,
  emiAmount,
  startDate,
}: EmiScheduleInput): Promise<EmiScheduleItem[]> => {
  const moonthlyRate = annualRate / 12 / 100;
  let balance: number = principal;

  const schedule: EmiScheduleItem[] = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const interestAmount: number = balance * moonthlyRate;
    const principalAmount: number = emiAmount - interestAmount;
    const closingBalance: number = balance - principalAmount;

    schedule.push({
      loanApplicationId: loanId,
      emiNo: i,
      dueDate: new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        startDate.getDate()
      ),
      openingBalance: Number(balance.toFixed(2)),
      interestAmount: Number(interestAmount.toFixed(2)),
      principalAmount: Number(principalAmount.toFixed(2)),
      emiAmount: Number(emiAmount.toFixed(2)),
      closingBalance: Number(closingBalance.toFixed(2)),
    });

    balance = closingBalance;
  }
  return schedule;
};
