import { DisbursementMode } from "../../../generated/prisma-client/enums.js";

export type CreateloanDisbursementInput = {
    disbursementMode: DisbursementMode,
    transactionReference: string,
    remarks?: string,
}