import { z } from "zod";

export const eligibilityCheckSchema = z.object({
  loanApplicationId: z.string().min(1),
});
