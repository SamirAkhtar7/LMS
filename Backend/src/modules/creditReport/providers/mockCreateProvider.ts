import { CreditProvider, CreditReportResult } from "./createdProvider.interface.js";

export class MockCreditProvider implements CreditProvider {
  async fetchCreditReport(customerId: string): Promise<CreditReportResult> {
    
    
    return {
      score: 742,
      accounts: [
        {
          lenderName: "HDFC Bank",
          accountType: "PERSONAL_LOAN",
          emiAmount: 4500,
          outstanding: 82000,
          status: "ACTIVE",
        },
        {
          lenderName: "ICICI Credit Card",
          accountType: "CREDIT_CARD",
          emiAmount: 3000,
          outstanding: 24000,
          status: "ACTIVE",
        },
      ],
    };
  }
}
