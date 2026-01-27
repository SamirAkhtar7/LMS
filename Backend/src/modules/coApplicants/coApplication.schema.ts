import { z } from "zod";
import { CoApplicantRelation } from "../../../generated/prisma-client/enums.js";
import { employmentTypeEnum } from "../LoanApplication/loanApplication.schema.js";


export const createCoApplicantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  relation: z.nativeEnum(CoApplicantRelation),
  contactNumber: z.string().min(10),
  email: z.string().email().optional(),

  dob: z.coerce.date().optional(),
  panNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),

  employmentType: employmentTypeEnum,
  monthlyIncome: z.coerce.number().optional(),
});
