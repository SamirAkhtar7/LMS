// rules/emi.rule.ts
import { RuleResult } from "./types.js";

export const emiRule = (
  monthlyIncome: number,
  existingEmi: number,
  newEmi: number,
): RuleResult => {
  const maxAllowedEmi = monthlyIncome * 0.5; // FOIR 50%

  if (existingEmi + newEmi > maxAllowedEmi) {
    return {
      rule: "EMI_FOIR",
      passed: false,
      reason: "EMI exceeds 50% of monthly income",
    };
  }

  return {
    rule: "EMI_FOIR",
    passed: true,
  };
};
