import { z } from "zod";

export const createPermissionsSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
});

export const assignPermissionsSchema = z.object({
  userId: z.string().trim().min(1),
  permissions: z.array(z.string().trim().min(1)).min(1),
});

export const userIdParamSchema = z.object({
  userId: z.string().trim().min(1),
});

export type CreatePermissionsBody = z.infer<typeof createPermissionsSchema>;
export type AssignPermissionsBody = z.infer<typeof assignPermissionsSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
