// age.rule.ts
import { RuleResult } from "./types.js";

export const ageRule = (
  dob: Date | null | undefined,
  minAge: number,
  maxAge: number,
): RuleResult => {
  if (!dob) {
    return {
      rule: "AGE_ELIGIBILITY",
      passed: false,
      reason: `Customer DOB missing`,
    };
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

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
