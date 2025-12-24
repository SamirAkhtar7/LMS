import { z } from "zod";

/* ================= CREATE ================= */

export const createPartnerSchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("PARTNER").optional(),

  phone: z.string().trim().min(1, "Phone is required"),

  isActive: z.coerce.boolean().optional(),
  partnerType: z.string().trim().optional(),
  experience: z.string().trim().optional(),
  targetArea: z.string().trim().optional(),
});

/* ================= UPDATE ================= */

export const updatePartnerSchema = z
  .object({
    fullName: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().trim().min(1).optional(),

    isActive: z.coerce.boolean().optional(),

    partnerType: z.string().trim().optional(),
    experience: z.string().trim().optional(),
    targetArea: z.string().trim().optional(),

    totalReferrals: z.coerce.number().int().min(0).optional(),
    activeReferrals: z.coerce.number().int().min(0).optional(),
    commissionEarned: z.coerce.number().min(0).optional(),
  })
  .strict(); // ⬅️ blocks extra fields (IMPORTANT)

/* ================= PARAM ================= */

export const partnerIdParamSchema = z.object({
  id: z.string().min(1, "id param is required"),
});
