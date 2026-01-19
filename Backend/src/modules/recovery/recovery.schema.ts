import { z } from "zod";
import { PaymentMode } from "../../../generated/prisma-client/enums.js";

export const recoveryPaymentSchema = z.object({
    amount: z.number().positive(),
    paymentMode: z.nativeEnum(PaymentMode),
    referenceNo: z.string().optional(),
});

/* Assigned to a particular loan recovery record  */


export const assignRecoverySchema = z.object({
  assignedTo: z.string().min(1),
});

export const updateRecoveryStageSchema = z.object({
    recoveryStage: z.enum([
    "INITIAL_CONTACT",
    "FIELD_VISIT",
    "NEGOTIATION",
    "LEGAL_ACTION",
    "SETTLEMENT",
    "CLOSED",
    ]),
    remarks: z.string().optional(),
});

