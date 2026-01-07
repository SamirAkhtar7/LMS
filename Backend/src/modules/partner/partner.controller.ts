import e, { Request, Response } from "express";
import {
  createPartnerService,
  getAllPartnerService,
  getPartnerByIdService,
  updatePartnerService,
} from "./partner.service.js";
import logger from "../../common/logger.js";

function sanitizeError(error: any) {
  return {
    message: error?.message ?? String(error),
    name: error?.name ?? "Error",
    code: error?.code ?? null,
    stack: error?.stack ?? null,
  };
}

//todo: add delete controller if needed & make permissions in auth middleware

export const createPartnerController = async (req: Request, res: Response) => {
  try {
    const { user, partner } = await createPartnerService(req.body);
    const { password: _pw, ...safeUser } = user;
    res.status(201).json({
      success: true,
      message: "Partner created successfully",
      data: { user: safeUser, partner },
    });
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    logger.error("createPartnerController error", sanitizeError(error));
    res.status(500).json({
      success: false,
      message: "Partner creation failed",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getAllPartnersController = async (req: Request, res: Response) => {
  try {
    const partners = await getAllPartnerService();
    res.status(200).json({
      success: true,
      message: "Partners retrieved successfully",
      data: partners,
    });
  } catch (error: any) {
    logger.error("getAllPartnersController error", sanitizeError(error));
    res.status(500).json({
      success: false,
      message: "Failed to retrieve partners",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const getPartnerByIdController = async (req: Request, res: Response) => {
  // Implementation for retrieving a partner by ID
  try {
    const { id } = req.params;
    const partner = await getPartnerByIdService(id);
    res.status(200).json({
      success: true,
      message: "Partner retrieved successfully",
      data: partner,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error("getPartnerByIdController error", sanitizeError(error));
    res.status(500).json({
      success: false,
      message: "Failed to retrieve partner",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const updatePartnerController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  try {
    const updatedPartner = await updatePartnerService(id, updateData);
    res.status(200).json({
      success: true,
      message: "Partner updated successfully",
      data: updatedPartner,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    logger.error("updatePartnerController error", sanitizeError(error));
    res.status(500).json({
      success: false,
      message: "Failed to update partner",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};
