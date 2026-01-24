import {
  CreditProvider,
  CreditReportResult,
} from "./creditProvider.interface.js";

export class CibilCreditProvider implements CreditProvider {
  async fetchCreditReport(input: {
    customerId: string;
    pan?: string;
    aadhar?: string;
  }): Promise<CreditReportResult> {
    // 🔒 Call actual CIBIL API here
    const response = await fetch("https://cibil.api/credit-report", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CIBIL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: input.customerId,
        pan: input.pan,
        aadhar: input.aadhar,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `CIBIL API request failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    const accounts = (data.accounts ?? []).map((a: any) => ({
      lenderName: a.memberName,
      accountType: a.accountType,
      emiAmount: a.emiAmount,
      outstanding: a.currentBalance,
      accountStatus: a.status,
      sanctionedAmount: a.sanctionedAmount,
      outstandingAmount: a.outstandingAmount,
      dpd: a.dpd,
    }));

    // Return only the `CreditReportResult` shape expected by the interface
    return {
      bureauReferenceId: data.controlNumber,
      creditScore: data.score,
      accounts,
      totalActiveLoans: accounts.filter(
        (a: any) => a.accountStatus === "ACTIVE",
      ).length,
      totalClosedLoans: accounts.filter(
        (a: any) => a.accountStatus === "CLOSED",
      ).length,
      totalOutstanding: accounts.reduce(
        (sum: number, a: any) => sum + (a.outstanding || 0),
        0,
      ),

      totalMonthlyEmi: accounts.reduce(
        (sum: number, a: any) => sum + (a.emiAmount ?? 0),
        0,
      ),

      maxDPD: Math.max(...accounts.map((a: any) => a.dpd ?? 0), 0),
      overdueAccounts: accounts.filter((a: any) => (a.dpd ?? 0) > 0).length,
      writtenOffCount: accounts.filter(
        (a: any) => a.accountStatus === "WRITTEN_OFF",
      ).length,
      settledCount: accounts.filter((a: any) => a.accountStatus === "SETTLED")
        .length,

      rawReport: data,
    };
  }
}
