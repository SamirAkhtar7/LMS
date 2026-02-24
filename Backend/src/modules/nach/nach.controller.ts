import { Request, Response } from "express";

import {
  activateMandateService,
  cancelMandateService,
  createNachMandateService,
  getMandateByLoanApplicationIdService,
  suspendMandateService,
} from "./nach.service.js";
import { createNachSchema } from "./nach.schema.js";

export const createNachMandateController = async (
  req: Request,
  res: Response,
) => {
  try {
    const parsed = createNachSchema.parse(req.body);
    const mandate = await createNachMandateService(parsed);
    res.status(201).json({
      success: true,
      message: "NACH mandate created successfully",
      data: mandate,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create NACH mandate",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const activateMandateController = async (
  req: Request,
  res: Response,
) => {
  try {
    const mandateId = req.params.id;
    const updatedMandate = await activateMandateService(mandateId);
    res.status(200).json({
      success: true,
      message: "NACH mandate activated successfully",
      data: updatedMandate,
    });
  } catch (error: any) {
    if (error.message?.includes("Mandate not found")) {
      return res.status(404).json({
        success: false,
        message: "Mandate not found",
        error: error.message || "NOT_FOUND",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to activate NACH mandate",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const suspendMandateController = async (req: Request, res: Response) => {
  try {
    const mandateId = req.params.id;
    const updatedMandate = await suspendMandateService(mandateId);
    res.status(200).json({
      success: true,
      message: "NACH mandate suspended successfully",
      data: updatedMandate,
    });
  } catch (error: any) {
    if (error.message?.includes("Mandate not found")) {
      return res.status(404).json({
        success: false,
        message: "Mandate not found",
        error: error.message || "NOT_FOUND",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to suspend NACH mandate",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const cancelMandateController = async (req: Request, res: Response) => {
  try {
    const mandateId = req.params.id;
    const mandate = await cancelMandateService(mandateId);
    res.status(200).json({
      success: true,
      message: "NACH mandate cancelled successfully",
      data: mandate,
    });
  } catch (error: any) {
    if (error.message?.includes("Mandate not found")) {
      return res.status(404).json({
        success: false,
        message: "Mandate not found",
        error: error.message || "NOT_FOUND",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to cancel NACH mandate",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getMandateByLoanApplicationIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { loanApplicationId } = req.params;
    const mandate =
      await getMandateByLoanApplicationIdService(loanApplicationId);
    res.status(200).json({
      success: true,
      message: "NACH mandate retrieved successfully",
      data: mandate,
    });
  } catch (error: any) {
    if (error.message?.includes("Mandate not found")) {
      return res.status(404).json({
        success: false,
        message: "Mandate not found",
        error: error.message || "NOT_FOUND",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to retrieve NACH mandate",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};
