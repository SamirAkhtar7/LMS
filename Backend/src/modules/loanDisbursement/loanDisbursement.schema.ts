import { z } from "zod";

export const disburseLoanSchema = z.object({
  disbursementMode: z.enum([
    "BANK_TRANSFER",
    "NEFT",
    "RTGS",
    "IMPS",
    "UPI",
    "CASH",
    "CHEQUE",
  ]),
  transactionReference: z.string().min(1),
  remarks: z.string().optional(),
});
