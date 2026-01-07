import { Request, Response } from "express";
import { createLoanTypeService } from "./loanTypes.service.js";




export const createLoanTypeController = async (req: Request, res: Response) => {
    try {
      
        const loanType = await createLoanTypeService( req.body );
        res.status(201).json({
            success: true,
            message: "Loan type created successfully",
            data: loanType,
        });
    }   catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create loan type",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};