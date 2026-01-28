import { Request, Response } from "express";
import {
  approveSettlementService,
  settleLoanService,
  applySettlementService,
  paySettlementService,
  rejectSettlementService,
  getAllSettlementsService,
  getSettlementByIdService,
  getSettlementsByLoanIdService,
  getPendingSettlementsService,
  getRejectedSettlementsService,
  getSettlementDashboardService,
} from "./loanSettlement.service.js";


import { getPayableAmountService } from "./loanSettlement.service.js";

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

export const applySettlementController = async (req: Request, res: Response) => {
    try {
        const { recoveryId } = req.params;
        const { remarks } = req.body;

        const recovery = await applySettlementService(
            recoveryId,
            remarks
        );
        res.status(200).json({
            success: true,
            message: "Settlement applied successfully",
            data: recovery,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to apply for settlement",
            error: error.message,
        });
    }

}

export const approveSettlementController = async (req: Request, res: Response) => {
    try {
        const { recoveryId } = req.params;
        const { settlementAmount } = req.body;
        const userId = req.user!.id;

        const recovery = await approveSettlementService(
            recoveryId,
            settlementAmount,
            userId
        );
        res.status(200).json({
            success: true,
            message: "Settlement approved successfully",
            data: recovery,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to approve settlement",
            error: error.message,
        });
    }

}

export const paySettlementController = async (req: Request, res: Response) => {
    try {
        const { recoveryId } = req.params;
        const { amount, paymentMode, referenceNo } = req.body;
        const userId = req.user!.id;
        const result = await paySettlementService(
            recoveryId,
            amount,
            paymentMode,
            referenceNo
        );
        res.status(200).json({
            success: true,
            message: "Settlement paid successfully",
            data: result,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to pay settlement",
            error: error.message,
        });
    }
}

export const rejectSettlementController = async (req: Request, res: Response) => {
    try {
        const { recoveryId } = req.params;
        const { remarks } = req.body;
        const result = await rejectSettlementService(
            recoveryId,
            remarks
        );
        res.status(200).json({
            success: true,
            message: "Settlement rejected successfully",    
            data: result,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to reject settlement",
            error: error.message,
        });
    }
}


export const getPayableAmountController = async (
    req: Request,
    res: Response
) => {
    try {
        const { recoveryId } = req.params;
        const result = await getPayableAmountService(recoveryId);
        res.status(200).json({
            success: true,
            message: "Payable amount retrieved successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve payable amount",
            error: error.message,
        });
    }

}

export const getAllSettlementsController = async (req: Request, res: Response) => {
    try {
        const settlements = await getAllSettlementsService({
            page: Number(req.query.page),
            limit: Number(req.query.limit),
            q: req.query.q?.toString(),
        });
        res.status(200).json({
            success: true,
            message: "Settlements retrieved successfully",
            data: settlements,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve settlements",
            error: error.message,
        });
    }
}
export const getSettlementByIdController = async (req: Request, res: Response) => {
    try {
        const { recoveryId } = req.params;
        const settlement = await getSettlementByIdService(recoveryId);
        res.status(200).json({
            success: true,
            message: "Settlement retrieved successfully",
            data: settlement,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve settlement",
            error: error.message,
        });
    }
}
export const getSettlementsByLoanIdController = async (req: Request, res: Response) => {
    try {
        const { loanId } = req.params;
        const settlements = await getSettlementsByLoanIdService(loanId);
        res.status(200).json({
            success: true,
            message: "Settlements retrieved successfully",
            data: settlements,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve settlements",
            error: error.message,
        });
    }
}
export const getPendingSettlementsController = async (req: Request, res: Response) => {
    try {
        const settlements = await getPendingSettlementsService();
        res.status(200).json({
            success: true,
            message: "Pending settlements retrieved successfully",
            data: settlements,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve pending settlements",
            error: error.message,
        });
    }
}
export const getRejectedSettlementsController = async (req: Request, res: Response) => {
    try {
        const settlements = await getRejectedSettlementsService();
        res.status(200).json({
            success: true,
            message: "Rejected settlements retrieved successfully",
            data: settlements,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve rejected settlements",
            error: error.message,
        });
    }
}
export const getSettlementDashboardController = async (req: Request, res: Response) => {
    try {
        const dashboardData = await getSettlementDashboardService();
        res.status(200).json({
            success: true,
            message: "Settlement dashboard data retrieved successfully",
            data: dashboardData,
        });
    }
    catch (error: any) {

        res.status(500).json({
            success: false,
            message: "Failed to retrieve settlement dashboard data",
            error: error.message,
        });
    }
}
