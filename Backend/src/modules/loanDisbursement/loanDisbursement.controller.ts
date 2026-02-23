import { Request, Response } from "express";
import { disburseLoanService } from "./loanDisbursement.service.js";


export const disburseloanController = async (req: Request, res: Response) => {
 
    try {
        const { id } = req.params;
        const result = await disburseLoanService(
            id,
            req.user!.id,
            req.body
        )

        res.status(200).json({
            success: true,
            message: "Loan disbursed successfully",
            data: result,
        });
    } catch (error: any) {
         res.status(error.statusCode || 400).json({
           success: false,
           message: "Failed to disburse loan",
           error: error.message || "INTERNAL_SERVER_ERROR",
         });
    }

}