import { Request, Response } from "express";
import {
    evaluateEligibilityService, 
} from "./ruleEngine.service.js";

export const checkEligibilityController = async (req: Request, res: Response) => {
    try {
        const { loanApplicationId } = req.params;
        const result = await evaluateEligibilityService(loanApplicationId);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }

}