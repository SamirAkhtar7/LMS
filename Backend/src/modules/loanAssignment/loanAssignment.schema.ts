import { z } from "zod";

export const assignLoanSchema = z.object({
  employeeId: z.string().min(1),
  role: z.enum(["PROCESSOR", "LEGAL", "TECHNICAL", "RECOVERY"]),
});

export const unassignLoanSchema = z.object({
    assignmentId: z.string().min(1),
})