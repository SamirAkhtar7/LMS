import { z } from "zod";

export const interestTypeEnum = z.enum(["flat", "reducing"]);

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
  title: z.enum(["MR", "MRS", "MS"]),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional(),
  middleName: z.string().trim().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dob: z
    .preprocess((v) => (v ? new Date(v as string) : v), z.date())
    .optional(),
  aadhaarNumber: z.string().trim().optional(),
  panNumber: z.string().trim().optional(),
  contactNumber: z.string().trim().min(1),
  alternateNumber: z.string().trim().optional(),
  email: z.string().email().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pinCode: z.string().trim().optional(),
  employmentType: z.enum(["SALARIED", "SELF_EMPLOYED", "BUSINESS"]),
  monthlyIncome: z.coerce.number().optional(),
  annualIncome: z.coerce.number().optional(),
});

export const createLoanApplicationSchema = z
  .object({
    // either reference an existing customer or supply customer details
    customerId: z.string().optional(),
    customer: customerInlineSchema.optional(),

    loanProductId: z.string().trim().min(1),
    requestedAmount: z.number().positive(),
    tenureMonths: z.coerce.number().int().optional(),
    interestRate: z.coerce.number().optional(),
    interestType: interestTypeEnum.optional(),
    emiAmount: z.coerce.number().optional(),
    totalPayable: z.coerce.number().optional(),
    loanPurpose: z.string().trim().optional(),
    cibilScore: z.coerce.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.customerId && !data.customer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either customerId or customer object must be provided",
        path: ["customerId"],
      });
    }
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
