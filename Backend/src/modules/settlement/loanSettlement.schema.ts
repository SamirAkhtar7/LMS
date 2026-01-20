import { z } from "zod";


export const loanSettlementSchema = z.object({
    settlementAmount: z.number().positive(),
    remarks: z.string().optional(),
})


export const applyForSettlementSchema = z.object({
    proposedAmount: z.number().positive(),
    reason: z.string()
})
