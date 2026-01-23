// age.rule.ts
import { RuleResult } from "./types.js";

export const ageRule = (
  dob: Date,
  minAge: number,
  maxAge: number,
): RuleResult => {
  const age = new Date().getFullYear() - new Date(dob).getFullYear();

  if (age < minAge || age > maxAge) {
    return {
      rule: "AGE_ELIGIBILITY",
      passed: false,
      reason: `Age ${age} not between ${minAge} and ${maxAge}`,
    };
  }

  return {
    rule: "AGE_ELIGIBILITY",
    passed: true,
  };
};
