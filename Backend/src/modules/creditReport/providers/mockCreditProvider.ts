import {
  CreditProvider,
  CreditReportResult,
  CreditAccount,
} from "./creditProvider.interface.js";

export class MockCreditProvider implements CreditProvider {
  async fetchCreditReport(input: {
    customerId: string;
    pan?: string;
    aadhar?: string;
  }): Promise<CreditReportResult> {
    const accounts: CreditAccount[] = [
      {
        lenderName: "HDFC Bank",
        accountType: "PERSONAL_LOAN",
        emiAmount: 4000,
        sanctionedAmount: 500000,
        outstandingAmount: 82000,
        accountStatus: "ACTIVE",
        dpd: 0,
      },
      {
        lenderName: "ICICI Credit Card",
        accountType: "CREDIT_CARD",
        emiAmount: 15000,
        sanctionedAmount: 200000,
        outstandingAmount: 24000,
        accountStatus: "ACTIVE",
        dpd: 12,
      },
    ];

    return {
      creditScore: 500,
      accounts,
      totalActiveLoans: 2,
      totalClosedLoans: 0,
     
      totalOutstanding: 106000,
      totalMonthlyEmi: 19000,
      maxDPD: 12,
      overdueAccounts: 1,
      writtenOffCount: 0,
      settledCount: 0,
      rawReport: { mock: true },
    };
  }
}
