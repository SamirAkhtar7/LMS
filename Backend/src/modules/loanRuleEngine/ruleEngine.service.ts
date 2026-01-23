import { prisma } from "../../db/prismaService.js";
import {
  ageRule,
  incomeRule,
  cibilRule,
  employmentRule,
  emiRule,
} from "./rules/index.js";
import { EligibilityResult } from "./ruleEngine.types.js";
import { calculateRiskScore } from "./risk/riskScoring.service.js";
import { MockCreditProvider } from "../creditReport/providers/mockCreateProvider.js";
import { calculateExistingEmi } from "./helpers/existingEmi.helper.js";

export const evaluateEligibilityService = async (
  loanApplicationId: string,
): Promise<EligibilityResult> => {
  /* ------------------- Fetch Data ------------------- */
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanApplicationId },
    include: {
      customer: true,
      loanType: true,
    },
  });

  if (!loan || !loan.customer || !loan.loanType) {
    throw new Error("Loan application or related data not found");
  }

  const ruleResults = [];

  // TODO
  // 🔁 Switch later
  const creditProvider = new MockCreditProvider();

  const existingEmi = await calculateExistingEmi(
    creditProvider,
    loan.customer.id,
  );
  // Prepare inputs for risk scoring
  const monthlyIncome = loan.customer.monthlyIncome ?? 0;
  const newEmi = loan.emiAmount ?? 0;
  const foir = monthlyIncome > 0 ? (existingEmi + newEmi) / monthlyIncome : 1;
  const loanToIncomeRatio =
    monthlyIncome > 0
      ? (loan.loanType.maxAmount ?? 0) / monthlyIncome
      : Infinity;
  const dob = loan.customer.dob ? new Date(loan.customer.dob) : null;
  const age = dob
    ? Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : 0;
  const risk = calculateRiskScore({
    cibilScore: loan.cibilScore ?? 0,
    foir,
    monthlyIncome,
    age,
    loanToIncomeRatio,
  });
  /* ------------------- Run Rules ------------------- */
  ruleResults.push(
    ageRule(loan.customer.dob, loan.loanType.minAge, loan.loanType.maxAge),
  );

  ruleResults.push(
    incomeRule(loan.customer.monthlyIncome ?? 0, loan.loanType.minIncome ?? 0),
  );

  ruleResults.push(
    cibilRule(loan.cibilScore ?? 0, loan.loanType.minCibilScore ?? 0),
  );

  ruleResults.push(
    employmentRule(
      loan.customer.employmentType,
      loan.loanType.employmentType ? [loan.loanType.employmentType] : [],
    ),
  );

  ruleResults.push(
    emiRule(
      loan.customer.monthlyIncome ?? 0,
      existingEmi, // existing EMI (can be extended later)
      loan.emiAmount ?? 0,
    ),
  );

  /* ------------------- Evaluate Result ------------------- */
  const failures = ruleResults.filter((r) => !r.passed);
  const eligible = failures.length === 0;
  const ruleSummary = {
    totalRules: ruleResults.length,
    passedRules: ruleResults.filter((r) => r.passed).length,
    failedRules: failures.length,
  };

  return {
    status: eligible ? "ELIGIBLE" : "INELIGIBLE",
    maxEligibleAmount: eligible ? loan.loanType.maxAmount : 0,
    eligibleEmi: eligible ? (loan.emiAmount ?? 0) : 0,
    reason: failures.map((f) => f.reason!).filter(Boolean),
    ruleSummary,
    risk,
  };
};
