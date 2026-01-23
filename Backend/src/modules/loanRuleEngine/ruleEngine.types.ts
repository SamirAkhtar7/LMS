export type RuleResult = {
  passed: boolean;
  reason?: string;
};

import { RiskScoreResult } from "./risk/risk.type.js";

export type EligibilityResult = {
  status: "ELIGIBLE" | "INELIGIBLE";
  maxEligibleAmount?: number;

  eligibleEmi: number;
  reason: string[];
  ruleSummary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
  };
  risk?: RiskScoreResult;
};
