import { CreditProvider } from "./providers/creditProvider.interface.js";
import { MockCreditProvider } from "./providers/mockCreditProvider.js";
import { CibilCreditProvider } from "./providers/cibilCreditProvider.js";
import ENV from "../../common/config/env.js";
export function getCreditProvider(): CreditProvider {
  switch (ENV.CREDIT_PROVIDER) {
    case "CIBIL":
      return new CibilCreditProvider();
    default:
      return new MockCreditProvider();
  }
}
