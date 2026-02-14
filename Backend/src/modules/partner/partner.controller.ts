import e, { Request, Response } from "express";
import {
  createPartnerService,
  getAllPartnerService,
  getPartnerByIdService,
  updatePartnerService,
  createPartnerLeadService,
  createPartnerLoanApplicationService,
  createChildPartnerService,
} from "./partner.service.js";
import logger from "../../common/logger.js";
import * as Enums from "../../../generated/prisma-client/enums.js";

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
    const partners = await getAllPartnerService(
      {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        q: req.query.q?.toString(),
      }
    );
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



export const createPartnerLeadController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }
    const leads = await createPartnerLeadService(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: leads,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create lead",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};


// export const calculatePartnerEarningsCommissionController = async(
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const {loanId } = req.params;
  
//     const earnings = await calculatePartnerEarningsCommissionService(loanId);
//     res.status(200).json({
//       success: true,
//       message: "Earnings and commission calculated successfully",
//       data: earnings,
//     });
//   } catch (error: any) {
//     logger.error("calculatePartnerEarningsCommissionController error", sanitizeError(error));
//     res.status(500).json({
//       success: false,
//       message: "Failed to calculate earnings and commission",
//       error: error.message || "INTERNAL_SERVER_ERROR",
//     });
//   }
// };

export const createPartnerLoanApplicationController = async (req: Request, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const loanApplication = await createPartnerLoanApplicationService(req.body, 
      { id: req.user.id, role: req.user.role as Enums.Role }
    );
    res.status(201).json({
      success: true,
      message: "Loan application created successfully",
      data: loanApplication,
    });
  }

  catch (error: any) {
    logger.error("createPartnerLoanApplicationController error", sanitizeError(error));
    res.status(500).json({
      success: false,
      message: "Failed to create loan application",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};

export const createChildPartnerController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const childPartner = await createChildPartnerService(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Child partner created successfully",
      data: childPartner,
    });
  }
  catch (error: any) {
    logger.error("createChildPartnerController error", sanitizeError(error));
    res.status(500).json({
      success: false,
      message: "Failed to create child partner",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};
