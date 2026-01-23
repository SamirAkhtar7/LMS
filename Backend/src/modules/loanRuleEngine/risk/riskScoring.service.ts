import { RISK_SCORE_WEIGHTS, RISK_GRADE_RULES } from "./risk.config.js";
import { RiskScoreResult } from "./risk.type.js";

export const calculateRiskScore = (input: {
  cibilScore: number;
  foir: number;
  monthlyIncome: number;
  age: number;
  loanToIncomeRatio: number;
}): RiskScoreResult => {
  let totalScore = 0;
  const reasons: string[] = [];
  // CIBIL Score
  if (input.cibilScore >= 750) {
    totalScore += RISK_SCORE_WEIGHTS.CIBIL;
    reasons.push("High CIBIL score");
  } else if (input.cibilScore >= 700) {
    totalScore += RISK_SCORE_WEIGHTS.CIBIL * 0.75;
    reasons.push("Moderate CIBIL score");
  } else if (input.cibilScore >= 650) {
    totalScore += RISK_SCORE_WEIGHTS.CIBIL * 0.5;
    reasons.push("Average CIBIL score");
  } else reasons.push("Low CIBIL score");

  // FOIR

  if (input.foir <= 0.3) totalScore += RISK_SCORE_WEIGHTS.FOIR;
  else if (input.foir <= 0.4) totalScore += RISK_SCORE_WEIGHTS.FOIR * 0.75;
  else if (input.foir <= 0.5) totalScore += RISK_SCORE_WEIGHTS.FOIR * 0.5;
  else reasons.push("High Emi burden (FOIR)");

  // Income
  if (input.monthlyIncome >= 100000) totalScore += RISK_SCORE_WEIGHTS.INCOME;
  else if (input.monthlyIncome >= 75000)
    totalScore += RISK_SCORE_WEIGHTS.INCOME * 0.75;
  else if (input.monthlyIncome >= 50000)
    totalScore += RISK_SCORE_WEIGHTS.INCOME * 0.5;
  else reasons.push("Low Monthly Income");
  // Age
  if (input.age >= 23 && input.age <= 55) totalScore += RISK_SCORE_WEIGHTS.AGE;
  else reasons.push("Age not in optimal range (23-55)");

  // loan to income ratio
  if (input.loanToIncomeRatio <= 10) totalScore += RISK_SCORE_WEIGHTS.LOAN_SIZE;
  else if (input.loanToIncomeRatio <= 15)
    totalScore += RISK_SCORE_WEIGHTS.LOAN_SIZE * 0.75;
  else reasons.push("High Loan to Income Ratio");

  const grade=RISK_GRADE_RULES.find((g) => totalScore >= g.minScore)?.grade ?? "F";
  return {
    grade,
    score: Math.round(totalScore),
    reasons,
  };
};
