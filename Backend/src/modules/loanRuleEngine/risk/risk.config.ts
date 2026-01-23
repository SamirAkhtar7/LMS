export const RISK_SCORE_WEIGHTS = {
  CIBIL: 40,
  FOIR: 25,
  INCOME: 15,
  AGE: 10,
  LOAN_SIZE: 10,
};
import { RiskGrade } from "./risk.type.js";

export const RISK_GRADE_RULES: { grade: RiskGrade; minScore: number }[] = [
  { grade: "A", minScore: 90 },
  { grade: "B", minScore: 75 },
  { grade: "C", minScore: 60 },
  { grade: "D", minScore: 45 },
  { grade: "E", minScore: 30 },
  { grade: "F", minScore: 0 },
];
