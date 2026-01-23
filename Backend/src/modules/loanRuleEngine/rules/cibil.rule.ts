import { RuleResult } from "./types.js";

export const cibilRule = (cibilScore: number, minCibilScore: number): RuleResult => {
  if (cibilScore < minCibilScore) {
      return {
        rule: "CIBIL_ELIGIBILITY",
        passed: false,
        reason: `Applicant's CIBIL score of ${cibilScore} is below the minimum required score of ${minCibilScore}`,
      };
  }
  return {
    rule: "CIBIL_ELIGIBILITY",
    passed: true,
    reason: `Applicant's CIBIL score of ${cibilScore} meets the minimum required score of ${minCibilScore}`,
  };
};
