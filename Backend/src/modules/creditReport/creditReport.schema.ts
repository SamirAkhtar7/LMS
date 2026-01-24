import { z } from "zod";
export const refreshCreditReportSchema = z.object({
  reason: z.string().min(1, "Reason for refreshing credit report is required"),
  force: z.boolean().optional().default(false),
});
export type RefreshCreditReportInput = z.infer<
  typeof refreshCreditReportSchema
>;
