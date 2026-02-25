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
    // Generate realistic mock data based on customerId hash
    const hash = this.hashString(input.customerId);
    const scenario = hash % 5; // 5 different credit profiles

    let accounts: CreditAccount[] = [];
    let creditScore = 300;
    let totalActiveLoans = 0;
    let totalClosedLoans = 0;
    let totalOutstanding = 0;
    let totalMonthlyEmi = 0;
    let maxDPD = 0;
    let overdueAccounts = 0;
    let writtenOffCount = 0;
    let settledCount = 0;

    switch (scenario) {
      case 0: // Excellent Credit - Prime Customer
        creditScore = 780 + (hash % 70); // 780-850
        accounts = [
          {
            lenderName: "HDFC Bank",
            accountType: "HOME_LOAN",
            emiAmount: 25000,
            sanctionedAmount: 3500000,
            outstandingAmount: 2800000,
            accountStatus: "ACTIVE",
            dpd: 0,
          },
          {
            lenderName: "ICICI Bank",
            accountType: "CAR_LOAN",
            emiAmount: 18000,
            sanctionedAmount: 800000,
            outstandingAmount: 450000,
            accountStatus: "ACTIVE",
            dpd: 0,
          },
          {
            lenderName: "SBI Credit Card",
            accountType: "CREDIT_CARD",
            emiAmount: 5000,
            sanctionedAmount: 500000,
            outstandingAmount: 35000,
            accountStatus: "ACTIVE",
            dpd: 0,
          },
          {
            lenderName: "Axis Bank",
            accountType: "PERSONAL_LOAN",
            emiAmount: 0,
            sanctionedAmount: 200000,
            outstandingAmount: 0,
            accountStatus: "CLOSED",
            dpd: 0,
          },
        ];
        totalActiveLoans = 3;
        totalClosedLoans = 1;
        totalOutstanding = 3285000;
        totalMonthlyEmi = 48000;
        maxDPD = 0;
        overdueAccounts = 0;
        break;

      case 1: // Good Credit - Minor Delays
        creditScore = 680 + (hash % 80); // 680-760
        accounts = [
          {
            lenderName: "Kotak Mahindra Bank",
            accountType: "PERSONAL_LOAN",
            emiAmount: 12000,
            sanctionedAmount: 500000,
            outstandingAmount: 280000,
            accountStatus: "ACTIVE",
            dpd: 15,
          },
          {
            lenderName: "HDFC Credit Card",
            accountType: "CREDIT_CARD",
            emiAmount: 3500,
            sanctionedAmount: 150000,
            outstandingAmount: 45000,
            accountStatus: "ACTIVE",
            dpd: 0,
          },
          {
            lenderName: "Bajaj Finserv",
            accountType: "CONSUMER_LOAN",
            emiAmount: 8000,
            sanctionedAmount: 180000,
            outstandingAmount: 95000,
            accountStatus: "ACTIVE",
            dpd: 8,
          },
        ];
        totalActiveLoans = 3;
        totalClosedLoans = 0;
        totalOutstanding = 420000;
        totalMonthlyEmi = 23500;
        maxDPD = 15;
        overdueAccounts = 2;
        break;

      case 2: // Fair Credit - Regular Delays
        creditScore = 580 + (hash % 80); // 580-660
        accounts = [
          {
            lenderName: "IDFC First Bank",
            accountType: "PERSONAL_LOAN",
            emiAmount: 9000,
            sanctionedAmount: 300000,
            outstandingAmount: 185000,
            accountStatus: "ACTIVE",
            dpd: 45,
          },
          {
            lenderName: "Standard Chartered",
            accountType: "CREDIT_CARD",
            emiAmount: 2500,
            sanctionedAmount: 100000,
            outstandingAmount: 78000,
            accountStatus: "ACTIVE",
            dpd: 30,
          },
          {
            lenderName: "Fullerton India",
            accountType: "PERSONAL_LOAN",
            emiAmount: 0,
            sanctionedAmount: 150000,
            outstandingAmount: 0,
            accountStatus: "SETTLED",
            dpd: 0,
          },
          {
            lenderName: "Yes Bank",
            accountType: "BUSINESS_LOAN",
            emiAmount: 15000,
            sanctionedAmount: 600000,
            outstandingAmount: 420000,
            accountStatus: "ACTIVE",
            dpd: 60,
          },
        ];
        totalActiveLoans = 3;
        totalClosedLoans = 0;
        totalOutstanding = 683000;
        totalMonthlyEmi = 26500;
        maxDPD = 60;
        overdueAccounts = 3;
        settledCount = 1;
        break;

      case 3: // Poor Credit - Multiple Defaults
        creditScore = 450 + (hash % 100); // 450-550
        accounts = [
          {
            lenderName: "Moneyview",
            accountType: "PERSONAL_LOAN",
            emiAmount: 7000,
            sanctionedAmount: 200000,
            outstandingAmount: 165000,
            accountStatus: "ACTIVE",
            dpd: 90,
          },
          {
            lenderName: "Capital First",
            accountType: "TWO_WHEELER_LOAN",
            emiAmount: 4500,
            sanctionedAmount: 80000,
            outstandingAmount: 52000,
            accountStatus: "ACTIVE",
            dpd: 120,
          },
          {
            lenderName: "IndusInd Bank",
            accountType: "CREDIT_CARD",
            emiAmount: 0,
            sanctionedAmount: 50000,
            outstandingAmount: 0,
            accountStatus: "WRITTEN_OFF",
            dpd: 0,
          },
          {
            lenderName: "Tata Capital",
            accountType: "CONSUMER_LOAN",
            emiAmount: 0,
            sanctionedAmount: 120000,
            outstandingAmount: 0,
            accountStatus: "SETTLED",
            dpd: 0,
          },
          {
            lenderName: "Home Credit",
            accountType: "CONSUMER_LOAN",
            emiAmount: 3500,
            sanctionedAmount: 60000,
            outstandingAmount: 38000,
            accountStatus: "ACTIVE",
            dpd: 75,
          },
        ];
        totalActiveLoans = 3;
        totalClosedLoans = 0;
        totalOutstanding = 255000;
        totalMonthlyEmi = 15000;
        maxDPD = 120;
        overdueAccounts = 3;
        writtenOffCount = 1;
        settledCount = 1;
        break;

      case 4: // New to Credit / Thin File
        creditScore = 720 + (hash % 50); // 720-770
        accounts = [
          {
            lenderName: "ICICI Bank",
            accountType: "CREDIT_CARD",
            emiAmount: 2000,
            sanctionedAmount: 100000,
            outstandingAmount: 15000,
            accountStatus: "ACTIVE",
            dpd: 0,
          },
          {
            lenderName: "Bajaj Finserv",
            accountType: "CONSUMER_LOAN",
            emiAmount: 5500,
            sanctionedAmount: 80000,
            outstandingAmount: 45000,
            accountStatus: "ACTIVE",
            dpd: 0,
          },
        ];
        totalActiveLoans = 2;
        totalClosedLoans = 0;
        totalOutstanding = 60000;
        totalMonthlyEmi = 7500;
        maxDPD = 0;
        overdueAccounts = 0;
        break;
    }

    return {
      creditScore,
      bureauReferenceId: `MOCK-${Date.now()}-${hash}`,
      accounts,
      totalActiveLoans,
      totalClosedLoans,
      totalOutstanding,
      totalMonthlyEmi,
      maxDPD,
      overdueAccounts,
      writtenOffCount,
      settledCount,
      rawReport: {
        mock: true,
        provider: "MOCK_CIBIL",
        generatedAt: new Date().toISOString(),
        customerId: input.customerId,
        pan: input.pan || "MOCKP1234A",
        aadhar: input.aadhar || "XXXX-XXXX-5678",
        scenario: scenario,
        creditProfile: [
          "Excellent Credit - Prime Customer",
          "Good Credit - Minor Delays",
          "Fair Credit - Regular Delays",
          "Poor Credit - Multiple Defaults",
          "New to Credit / Thin File",
        ][scenario],
      },
    };
  }

  // Simple hash function to generate consistent data for same customerId
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
