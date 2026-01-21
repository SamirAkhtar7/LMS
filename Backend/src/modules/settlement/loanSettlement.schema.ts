import { z } from "zod";


export const loanSettlementSchema = z.object({
    settlementAmount: z.number().positive(),
    remarks: z.string().optional(),
})


export const applySettlementSchema = z.object({
  remarks: z.string().min(3).optional(),
});


export const approveSettlementSchema = z.object({
    settlementAmount: z.number().positive(),
    approvedBy: z.string().min(3),
})
