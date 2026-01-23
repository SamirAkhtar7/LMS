import { CreditProvider } from "../../creditReport/providers/creditProvider.interface.js";

export const calculateExistingEmi = async (
  creditProvider: CreditProvider,
  customerId: string,
): Promise<number> => {
  const report = await creditProvider.fetchCreditReport(customerId);

  // validate report and accounts
  if (!report || !Array.isArray(report.accounts)) return 0;

  // safely sum numeric emiAmount values for ACTIVE accounts
  let total = 0;
  for (const a of report.accounts) {
    if (!a || a.status !== "ACTIVE") continue;
    const emi = Number((a as any).emiAmount);
    if (Number.isFinite(emi)) total += emi;
  }

  return total;
};
