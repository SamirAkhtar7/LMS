
import { z } from "zod";

export const createNachSchema = z.object({
  loanApplicationId: z.string(),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  ifscCode: z.string().min(1),
  maxDebitAmount: z.number().positive(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const activateMandateSchema = z.object({
  mandateId: z.string(),
});