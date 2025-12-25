import { z } from "zod";

/* ================= CREATE ================= */

export const createEmployeeSchema = z
  .object({
    // allow top-level user fields commonly sent with employee creation
    fullName: z.string().trim().min(1),
    email: z.string().trim().email(),
    password: z.string().min(8),
    role: z.enum(["ADMIN", "EMPLOYEE", "PARTNER"]),
    contactNumber: z.string().trim().min(10).max(15),
    isActive: z.coerce.boolean(),
    userName: z.string().trim().min(1),
    mobileNumber: z.string().min(10),
    atlMobileNumber: z.string().min(10),
    dob: z.coerce.date(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]),
    designation: z.string().min(1),
    emergencyContact: z.string().min(10),
    emergencyRelationship: z.string().min(1),
    experience: z
      .union([z.string().min(1), z.number().nonnegative()])
      .optional(),
    reportingManagerId: z.string().optional(),
    workLocation: z
      .string()
      .trim()
      .transform((s) => s.toUpperCase())
      .refine((v) => ["ONSITE", "REMOTE", "HYBRID"].includes(v), {
        message: 'Invalid option: expected one of "ONSITE"|"REMOTE"|"HYBRID"',
      })
      .optional(),
    department: z.string().min(1),
    dateOfJoining: z.string().optional(),
    salary: z.number().positive().optional(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pinCode: z.string().min(6),
  })
  .strict();

/* ================= UPDATE ================= */

export const updateEmployeeSchema = z
  .object({
    fullName: z.string().trim().min(1).optional(),

    email: z.string().email().optional(),

    password: z.string().min(8).optional(),

    role: z.enum(["ADMIN", "EMPLOYEE", "PARTNER"]).optional(),

    contactNumber: z.string().trim().min(10).optional(),
    isActive: z.coerce.boolean().optional(),

    // TODO: employeeCode should be immutable later
    employeeCode: z.string().trim().min(1).optional(),

    designation: z.string().trim().min(1).optional(),

    branchId: z.string().trim().min(1).optional(),

    department: z.string().trim().min(1).optional(),

    joiningDate: z.coerce.date().optional(),
  })
  .strict();

/* ================= PARAM ================= */

export const employeeIdParamSchema = z.object({
  id: z.string().min(1, "id param is required"),
});
