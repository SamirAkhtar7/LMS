import { z } from "zod";
import {
  CoApplicantRelation,
  CommissionType,
  InterestType,
} from "../../../generated/prisma-client/enums.js";

export const titleEnum = z.enum(["MR", "MRS", "MS", "DR", "PROF"]);
export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export const employmentTypeEnum = z.enum([
  "salaried",
  "self_employed",
  "business",
]);

export const maritalStatusEnum = z.enum([
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
  "OTHER",
]);

export const CategoryEnum = z.enum(["GENERAL", "SC", "ST", "OBC", "OTHER"]);

export const CoApplicantRelationEnum = z.enum([
  "SPOUSE",
  "PARENT",
  "SIBLING",
  "CHILD",
  "FRIEND",
  "COLLEAGUE",
  "OTHER",
  "BUSINESS_PARTNER",
  "FATHER",
  "MOTHER",
]);

export const interestTypeEnum = z.enum(["FLAT", "REDUCING"]);

export const loanStatusEnum = z.enum([
  "draft",
  "submitted",
  "kyc_pending",
  "credit_check",
  "under_review",
  "approved",
  "rejected",
  "disbursed",
  "active",
  "closed",
  "written_off",
  "defaulted",
  "application_in_progress",
]);

export const customerInlineSchema = z.object({
  title: titleEnum,
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional(),
  middleName: z.string().trim().optional(),
  gender: genderEnum.optional(),
  dob: z.preprocess((v) => (v ? new Date(v as string) : v), z.date()),
  aadhaarNumber: z.string().trim(),
  panNumber: z.string().trim(),
  voterId: z.string().trim().optional(),
  contactNumber: z.string().trim().min(1),

  alternateNumber: z.string().trim().optional(),
  email: z.string().email().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pinCode: z.string().trim().optional(),
  employmentType: employmentTypeEnum,
  monthlyIncome: z.coerce.number().optional(),
  annualIncome: z.coerce.number().optional(),
});

export const createLoanApplicationSchema = z.object({
  // Customer fields
  title: titleEnum,
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1).optional(),
  middleName: z.string().trim().min(1).optional(),
  gender: genderEnum,
  dob: z.coerce.date(),
  aadhaarNumber: z.string().trim().min(1),
  panNumber: z.string().trim().min(1),
  voterId: z.string().trim().min(1).optional(),
  contactNumber: z.string().trim().min(1),
  alternateNumber: z.string().trim().min(1).optional(),
  employmentType: employmentTypeEnum,
  maritalStatus: maritalStatusEnum,
  nationality: z.string().trim().min(1),
  category: CategoryEnum,
  spouseName: z.string().trim().min(1).optional(),
  passportNumber: z.string().trim().min(1).optional(),
  monthlyIncome: z.coerce.number(),
  annualIncome: z.coerce.number(),
  otherIncome: z.coerce.number().optional(),

  email: z.string().trim().email().optional(),
  address: z.string().trim().min(1),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  pinCode: z.string().trim().min(1),

  // Bank (optional – stored later if needed)
  bankName: z.string().trim().min(1),
  bankAccountNumber: z.string().trim().min(1),
  ifscCode: z.string().trim().min(1),
  accountType: z.string().trim().min(1),

  // Loan fields
  loanTypeId: z.string().trim().min(1),
  requestedAmount: z.coerce.number().positive(),
  tenureMonths: z.coerce.number().int().optional(),

  interestRate: z.coerce.number().optional(),
  interestType: interestTypeEnum.optional(),
  emiAmount: z.coerce.number().optional(),
  purposeDetails: z.string().trim().min(1).optional(),
  loanPurpose: z.string().trim().min(1).optional(),
  cibilScore: z.coerce.number().int().optional(),

  coApplicantName: z.string().trim().min(1).optional(),
  coApplicantContact: z.string().trim().min(1).optional(),
  coApplicantIncome: z.coerce.number().optional(),
  coApplicantPan: z.string().trim().min(1).optional(),
  coApplicantAadhaar: z.string().trim().min(1).optional(),
  coApplicantRelation: CoApplicantRelationEnum.optional(),
});

export const updateLoanApplicationSchema = createLoanApplicationSchema
  .partial()
  .extend({
    status: loanStatusEnum.optional(),
    approvedAmount: z.coerce.number().optional(),
    approvalDate: z
      .preprocess((v) => (v ? new Date(v as string) : v), z.date())
      .optional(),
    activationDate: z
      .preprocess((v) => (v ? new Date(v as string) : v), z.date())
      .optional(),
    rejectionReason: z.string().trim().optional(),
  })
  .passthrough();

export const loanApplicationIdParamSchema = z.object({
  id: z.string().min(1, "id param is required"),
});

export type CreateLoanApplicationBody = z.infer<
  typeof createLoanApplicationSchema
>;
export type UpdateLoanApplicationBody = z.infer<
  typeof updateLoanApplicationSchema
>;

export default createLoanApplicationSchema;

export const apperoveLoanInputSchema = z.object({
  latePaymentFeeType: z.nativeEnum(CommissionType),
  latePaymentFee: z.number().min(0),
  bounceCharges: z.number().min(0),

  prepaymentChargeType: z.nativeEnum(CommissionType),
  prepaymentAllowed: z.boolean().optional(),
  prepaymentDate: z.coerce.date().optional(),
  prepaymentCharges: z.number().min(0),

  foreclosureChargesType: z.nativeEnum(CommissionType),
  foreclosureAllowed: z.boolean().optional(),
  foreclosureDate: z.coerce.date().optional(),
  foreclosureCharges: z.number().min(0),

  // Approval-related fields
  approvedAmount: z.number().positive(),
  tenureMonths: z.number().int().positive(),
  interestType: z.nativeEnum(InterestType),
  interestRate: z.number().min(0).max(100),
  emiStartDate: z.coerce.date().optional(),
  emiPaymentAmount: z.number().min(0).optional(),
  emiAmount: z.number().min(0).optional(),
});

export type ApperoveLoanInput = z.infer<typeof apperoveLoanInputSchema>;
