import { Request, Response } from "express";
import { settleLoanService } from "./loanSettlement.service.js";

// import { processLoanSettlementService, settleLoanService } from "./loanSettlement.service.js";


export const settleLoanController = async (req: Request, res: Response) => {

    try

        {
        const { recoveryId } = req.params;
    
        const result = await settleLoanService(
            recoveryId,
         
            req.body
        );
         
        
        res.status(200).json({
            success: true,
            message: "Loan settled successfully",
            data: result,
        });
    }
    catch (error : any) {
        res.status(500).json({
            success: false,
            message: "Failed to settle loan",
            error: error.message,
        });
    }
}