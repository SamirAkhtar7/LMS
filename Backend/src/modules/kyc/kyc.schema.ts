
import { z } from "zod";

export const uploadKycDocumentSchema = z.object({
  kycId: z.string().min(1),
  documentType: z.enum([
    "AADHAAR",
    "PAN",
    "SALARY_SLIP",
    "BANK_STATEMENT",
    "PHOTO",
  ]),
});
