import { z } from "zod";

/* ================= CREATE ================= */

export const createEmployeeSchema = z
  .object({
    fullName: z.string().trim().min(1, "fullName is required"),

    email: z.string().email("Valid email is required"),

    password: z.string().min(8, "Password must be at least 8 characters"),

    role: z.literal("EMPLOYEE").optional(),

    phone: z.string().trim().min(1, "Phone is required"),

    isActive: z.coerce.boolean().optional(),
  })
  .strict();

/* ================= UPDATE ================= */

export const updateEmployeeSchema = z
  .object({
    fullName: z.string().trim().min(1).optional(),

    email: z.string().email().optional(),

    password: z.string().min(8).optional(),

    role: z.enum(["ADMIN", "EMPLOYEE", "PARTNER"]).optional(),

    phone: z.string().trim().min(1).optional(),

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
