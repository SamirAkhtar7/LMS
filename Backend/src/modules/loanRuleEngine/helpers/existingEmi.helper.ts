import { CreditProvider } from "../../creditReport/providers/createdProvider.interface.js";

export const calculateExistingEmi = async (
  creditProvider: CreditProvider,
  customerId: string,
) => {
  const report = await creditProvider.fetchCreditReport(customerId);

  return report.accounts
    .filter((a) => a.status === "ACTIVE")
    .reduce((sum, a) => sum + a.emiAmount, 0);
};
