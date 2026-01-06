export interface EmiScheduleInput {
  loanId: string;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: Date;
}

export interface EmiScheduleItem {
  loanApplicationId: string;
  emiNo: number;
  dueDate: Date;
  openingBalance: number;
  interestAmount: number;
  principalAmount: number;
  emiAmount: number;
  closingBalance: number;
}
