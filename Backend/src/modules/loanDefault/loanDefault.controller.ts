import { Request, Response } from "express";
import { checkAndMarkLoanDefault } from "./loanDefault.service.js";
import { getAllDefaultedLoansService ,getDefaultLoanByIdService } from "./loanDefault.service.js";


export const markLoanDefaultController = async (req: Request, res: Response) => {
    const { loanId } = req.params;

    try {
        const result = await checkAndMarkLoanDefault(loanId);
       if(!result){
        return res.status(404).json({ message: "Loan application not found or not active" });
       }
        res.status(200).json({
          success: true,
          message: "Loan default status checked and updated successfully",
          data: result,
        });
    } catch (error: any) {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to process loan default",
          error: error.message,
        });
    }
} 


export const getAllDefaultedLoansController = async (req: Request, res: Response) => {
    try {
        const defaultedLoans = await getAllDefaultedLoansService();
        res.status(200).json({
            success: true,
            message: "Defaulted loans retrieved successfully",
            data: defaultedLoans,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve defaulted loans",
            error: error.message,
        });
    }
}

export const getDefaultedLoanByIdController = async ( req: Request, res: Response ) => {
    const { loanId } = req.params;
    try {
        const defaultedLoans = await getDefaultLoanByIdService(loanId);
        res.json({
            success: true,
            message: "Defaulted loan retrieved successfully",
            data: defaultedLoans,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve defaulted loan",
            error: error.message,
        });
    }

}