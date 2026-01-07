import { z } from "zod";
import {
  InterestType,
  CommissionType,
  EmploymentType,
  LoanTypes,
} from "../../../generated/prisma-client/enums.js";

export const createLoanTypeSchema = z.object({
  code: z.string().trim().uppercase().min(3).max(50),
  name: z.string().trim().min(3).max(100),
  description: z.string().optional(),

  category: z.nativeEnum(LoanTypes),
  secured: z.boolean().default(false),

  minAmount: z.number().positive(),
  maxAmount: z.number().positive(),
  minTenureMonths: z.number().int().positive(),
  maxTenureMonths: z.number().int().positive(),

  interestType: z.nativeEnum(InterestType),
  minInterestRate: z.number().min(0),
  maxInterestRate: z.number().min(0),
  defaultInterestRate: z.number().min(0),

  processingFeeType: z.nativeEnum(CommissionType),
  processingFee: z.number().min(0),
  gstApplicable: z.boolean().default(true),
  gstPercentage: z.number().min(0).max(100).optional(),

  minAge: z.number().int().min(18),
  maxAge: z.number().int().max(100),
  minIncome: z.number().optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),

  minCibilScore: z.number().int().min(300).max(900).optional(),
  maxCibilScore: z.number().int().min(300).max(900).optional(),

  maxLoanToValueRatio: z.number().min(0).max(100).optional(),

  prepaymentAllowed: z.boolean().default(true),
  foreclosureAllowed: z.boolean().default(true),
  prepaymentCharges: z.number().min(0).optional(),
  foreclosureCharges: z.number().min(0).optional(),

  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
  approvalRequired: z.boolean().default(true),

  estimatedProcessingTimeDays: z.number().int().positive().optional(),
  documentsRequired: z.string().optional(),
});


export const updateLoanTypeSchema = createLoanTypeSchema.partial();

export const loanTypeIdSchema = z.object({
  id: z.string().cuid(),
});
export const loanTypeListQuerySchema = z.object({
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  category: z.nativeEnum(LoanTypes).optional(),
});
