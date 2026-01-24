import { CreditProvider } from "../../creditReport/providers/creditProvider.interface.js";
import { getOrCreateCreditReport } from "../../creditReport/creditReport.service.js";

export const calculateExistingEmi = async (
  creditProvider: CreditProvider,
  customerId: string,
): Promise<number> => {
  const report = await getOrCreateCreditReport(creditProvider, customerId, {});

  // normalize accounts: provider result uses `accounts`, DB uses Prisma relation `creditAccount`
  const rawAccounts: any[] = Array.isArray((report as any).accounts)
    ? (report as any).accounts
    : Array.isArray((report as any).creditAccount)
      ? (report as any).creditAccount.map((ca: any) => ({
          lenderName: ca.lenderName,
          accountType: ca.accountType,
          emiAmount: ca.emiAmount,
          outstandingAmount: ca.outstanding,
          sanctionedAmount: ca.sanctionedAmount,
          dpd: ca.dpd,
          accountStatus: ca.accountStatus,
        }))
      : [];

  // safely sum numeric emiAmount values for ACTIVE accounts
  let total = 0;
  for (const a of rawAccounts) {
    if (!a || a.accountStatus !== "ACTIVE") continue;
    const emi = Number(a.emiAmount);
    if (Number.isFinite(emi)) total += emi;
  }

  return total;
};
