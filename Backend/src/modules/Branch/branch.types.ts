import { z } from 'zod';
 import {BranchType} from "../../../generated/prisma-client/enums.js";
export type CreateBranchInput = {
  name: string;
  code: string;
  type: BranchType;
  parentBranchId?: string | null;
};


export type updateBranchInput = {
    name: string;
    isActive: boolean;
}


export const branchIdParamSchema = z.object({
    id: z.string().uuid(),
})