export type CreditAccount = {
  lenderName: string;
  accountType: string;
  emiAmount: number;
  outstanding: number;
  status: "ACTIVE" | "CLOSED";
};

export type CreditReportResult = {
  score: number;
  accounts: CreditAccount[];
};

export interface CreditProvider {
  fetchCreditReport(customerId: string): Promise<CreditReportResult>;
}
