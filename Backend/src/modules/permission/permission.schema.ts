import { z } from "zod";

export const createPermissionsSchema = z.object({
  code: z.string().trim().min(1).max(100).regex(/^[a-z0-9_-]+$/, "Code must be lowercase alphanumeric with hyphens or underscores"),
  name: z.string().trim().min(1).max(255),
});

export const assignPermissionsSchema = z.object({
  userId: z.string().trim().min(1).max(100),
  permissions: z.array(z.string().trim().min(1).max(100)).min(1).max(50),
});
export const userIdParamSchema = z.object({
  userId: z.string().trim().min(1),
});

export type CreatePermissionsBody = z.infer<typeof createPermissionsSchema>;
export type AssignPermissionsBody = z.infer<typeof assignPermissionsSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
