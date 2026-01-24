import { CreditProvider } from "./providers/creditProvider.interface.js";
import { MockCreditProvider } from "./providers/mockCreditProvider.js";
import { CibilCreditProvider } from "./providers/cibilCreditProvider.js";
import ENV from "../../common/config/env.js";
export function getCreditProvider(): CreditProvider {
  switch (ENV.CREDIT_PROVIDER) {
    case "CIBIL":
      return new CibilCreditProvider();
    case "MOCK":
      return new MockCreditProvider();
    default:
      throw new Error(`Unknown CREDIT_PROVIDER: ${ENV.CREDIT_PROVIDER}`);
  }
}
