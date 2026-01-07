import { string, z } from "zod";

export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);


export const statusEnum = z.enum([
 "CONTACTED",
  "INTERESTED",
  "APPLICATION_IN_PROGRESS",
  "APPLICATION_SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "FUNDED",
  "CLOSED",
  "DROPPED",
  "PENDING"
]);

export const createLeadSchema = z
  .object({
    fullName: z.string().trim().min(1, "fullName is required"),
    contactNumber: z.string().trim().min(1, "contactNumber is required"),
    email: z.string().email("Valid email is required"),
    dob: z.coerce.date(),
    gender: genderEnum,
    loanAmount: z.coerce.number().nonnegative(),
    loanType: string().trim().min(1, "loanType is required")  ,
    city: z.string().trim().nullable(),
    state: z.string().trim().nullable(),
    pinCode: z.string().trim().nullable(),
    address: z.string().trim().nullable(),

    assignedTo: z.string().trim().optional().nullable(),
    assignedBy: z.string().trim().optional().nullable(),
    status: z.string().trim().optional(),
  })
  .strict();

export const updateLeadSchema = createLeadSchema.partial();


export const updateLeadStatusSchema = z.object({
  status: statusEnum,
});

export const leadIdParamSchema = z.object({
    id: z.string().min(1, "id param is required"),

});

export const leadStatusParamSchema = z.object({
    status: z.string().min(1, "status param is required"),  
});

export const leadAssigedSchema = z.object({
    assignedTo: z.string().trim().min(1, "assignedTo is required"),
  // assignedBy is optional in the payload because the server derives it from the authenticated user
 // assignedBy: z.string().trim().min(1, "assignedBy is required").optional().nullable(),
});
