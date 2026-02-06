import  { Request, Response } from "express";
import {
  getRecoveryByLoanIdService,
  payRecoveryAmountService,
  assignRecoveryAgentService,
  updateRecoveryStageService,
  getLoanWithRecoveryService,
  getAllRecoveriesService,
  getRecoveryDetailsService,
  getRecoveriesByAgentService,
  getRecoveryDashboardService,
} from "./recovery.service.js";
import { recovery_stage } from "../../../generated/prisma-client/enums.js";

export const getRecoveryByLoanIdController = async (
  req: Request,
  res: Response
) => {
    const { loanId } = req.params;
  try {
  const recovery = await getRecoveryByLoanIdService(loanId);

  if (!recovery) {
    return res.status(404).json({
      success: false,
      message: "Recovery record not found for the given loan ID",
    });
  }
  res.status(200).json({
    success: true,
    message: "Recovery record retrieved successfully",
    data: recovery,
  });
    } catch (error: any) {
    res.status(500).json({
      success: false,
        message: error.message || "Failed to retrieve recovery record",
        error: error.message,
    });
    }
};

export const payRecoveryAmountController = async (
  req: Request,
  res: Response
) => {
  const { recoveryId } = req.params;
  const { amount, paymentMode, referenceNo } = req.body;
    try {
      
           if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
               success: false,
                message: "Valid positive amount is required",
            });
        }
        if (!paymentMode) {
            return res.status(400).json({
                success: false,
               message: "paymentMode is required",
           });
        }
    const recovery = await payRecoveryAmountService(
      recoveryId,
      amount,
      paymentMode,
      referenceNo
    );

    res.json({
      success: true,
      message: "Recovery amount paid successfully",
      data: recovery,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to pay recovery amount",
      error: error.message,
    });
  }
};

export const assignRecoveryAgentController = async (
  req: Request,
  res: Response
) => {
  const { recoveryId } = req.params;
  const { assignedTo } = req.body;
  try {
    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "assignedTo field is required",
      });
    }

    const recovery = await assignRecoveryAgentService(recoveryId, assignedTo);
    res.status(200).json({
      success: true,
      message: "Recovery agent assigned successfully",
      data: recovery,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign recovery agent",
      error: error.message,
    });
  }
};

export const updateRecoveryStageController = async (
  req: Request,
  res: Response
) => {
  const { recoveryId } = req.params;
  const { recoveryStage, remarks } = req.body;
    try {
            if (!recoveryStage || !Object.values(recovery_stage).includes(recoveryStage)) {
            return res.status(400).json({
                success: false,
                message: "Valid recoveryStage is required",
            });
        }
         
    const recovery = await updateRecoveryStageService(
      recoveryId,
      recoveryStage as recovery_stage,
      remarks
    );
    res.status(200).json({
      success: true,
      message: "Recovery stage updated successfully",
      data: recovery,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update recovery stage",
      error: error.message,
    });
  }
};

export const getLoanWithRecoveryController = async (
  req: Request,
  res: Response
) => {
  try {
    const loans = await getLoanWithRecoveryService();
    res.status(200).json({
      success: true,
      message: "Loans with recovery records retrieved successfully",
      data: loans,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to retrieve loans with recovery records",
      error: error.message,
    });
  }
};

export const getAllRecoveriesController = async (
  req: Request,
  res: Response
) => {
  try {
    const recoveries = await getAllRecoveriesService({
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      q: req.query.q?.toString(),
      status: req.query.status?.toString(),
    },
      {
        id: req.user!.id,
        role: (req.user as any).role,
        branchId: (req.user as any).branchId
        
      }
      
  );
    res.status(200).json({
      success: true,
      message: "All recoveries retrieved successfully",
      data: recoveries,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recoveries",
      error: error.message,
    });
  }
};

export const getRecoveryDetailsController = async (
  req: Request,
  res: Response
) => {
  const { recoveryId } = req.params;
  try {
    const recovery = await getRecoveryDetailsService(recoveryId);
    if (!recovery) {
      return res.status(404).json({
        success: false,
        message: "Recovery record not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Recovery record retrieved successfully",
      data: recovery,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recovery record",
      error: error.message,
    });
  }
};

export const getRecoveryByAgentController = async (
  req: Request,
  res: Response
) => {
  const { agentId } = req.params;
  try {
    const recoveries = await getRecoveriesByAgentService(agentId);
    res.status(200).json({
      success: true,
      message: "Recovery records retrieved successfully",
      data: recoveries,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recovery records",
      error: error.message,
    });
  }
};

export const getRecoveryDashboardController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getRecoveryDashboardService(req.user as { role: string; branchId?: string });

    res.status(200).json({
      success: true,
      message: "Recovery dashboard data retrieved successfully",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve recovery dashboard data",
      error: error.message,
    });
  }
};
