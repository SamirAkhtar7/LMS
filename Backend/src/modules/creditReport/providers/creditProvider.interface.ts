export type CreditAccount = {
  lenderName: string;
  accountType: string;
  emiAmount: number;
  sanctionedAmount?: number;
  outstandingAmount?: number;
  dpd?: number;
  accountStatus: "ACTIVE" | "CLOSED" | "SETTLED" | "WRITTEN_OFF";
};

export type CreditReportResult = {
  creditScore: number;
  bureauReferenceId?: string;
  accounts: CreditAccount[];
  totalActiveLoans: number;
  totalClosedLoans: number;
  totalOutstanding: number;
  totalMonthlyEmi: number;
  maxDPD: number;
  overdueAccounts: number;
  writtenOffCount: number;
  settledCount: number;

  rawReport: any;
};

export interface CreditProvider {
  fetchCreditReport(input: {
    customerId: string
    pan?: string
    aadhar?: string
  }): Promise<CreditReportResult>;
}


// export type CreditReportPayload = {
//   bureauReferenceId?: string;
//   creditScore: number | null;
//   accounts: CreditAccount[];

//   // Aggregates (MANDATORY)
//   totalActiveAccounts: number;
//   totalClosedAccounts: number;
//   totalOutstanding: number;
//   totalMonthlyEmi: number;

//   maxDPD: number;
//   overdueAccounts: number;
//   writtenOffCount: number;
//   settledCount: number;

//   rawReport: any;
// };