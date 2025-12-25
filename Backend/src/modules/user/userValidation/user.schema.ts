import { z } from "zod";

/* ================= CREATE USER ================= */

export const createUserSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),

    email: z.string().email("Valid email is required"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must not exceed 128 characters"),
    isActive: z.coerce.boolean().optional(),

    role: z.enum(["ADMIN", "EMPLOYEE", "PARTNER"] as const).optional(),

    contactNumber: z
      .string()
      .trim()
      .min(1, " contactNumber number is required"),
  })
  .strict();

/* ================= UPDATE USER ================= */

export const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(1).optional(),

    email: z.string().email().optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(128, "Password must not exceed 128 characters")
      .optional(),
    role: z.enum(["ADMIN", "EMPLOYEE", "PARTNER"] as const).optional(),

    contactNumber: z.string().trim().min(1).optional(),
  })
  .strict();
/* ================= PARAM ================= */

export const userIdParamSchema = z.object({
  id: z.string().min(1, "id param is required"),
});
