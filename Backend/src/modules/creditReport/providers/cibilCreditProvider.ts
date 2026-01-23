import { CreditProvider } from "./createdProvider.interface.js";

export class CibilCreditProvider implements CreditProvider {
  async fetchCreditReport(customerId: string) {
    // 🔒 Call actual CIBIL API here
    const response = await fetch("https://cibil.api/credit-report", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CIBIL_API_KEY}`,
      },
      body: JSON.stringify({ customerId }),
    });

    const data = await response.json();

    // 🔄 Map CIBIL response → internal format
    return {
      score: data.score,
      accounts: data.accounts.map((a: any) => ({
        lenderName: a.memberName,
        accountType: a.accountType,
        emiAmount: a.emiAmount,
        outstanding: a.currentBalance,
        status: a.status,
      })),
    };
  }
}
