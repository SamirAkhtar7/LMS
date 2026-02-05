import { z } from "zod";
import { BranchType } from "../../../generated/prisma-client/enums.js";

export const createBranchSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.nativeEnum(BranchType),
  parentBranchId: z.string().nullable().optional(),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  type: z.nativeEnum(BranchType).optional(),
  parentBranchId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const branchIdParamSchema = z.object({
  id: z.string().cuid(),
});
