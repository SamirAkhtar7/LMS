import { Request, Response } from "express";
import {
  updateKycStatusService,
  uploadKycDocumentService,
  verifyDocumentService,
} from "./kyc.service.js";
import logger from "../../common/logger.js";
import { ca } from "zod/locales";



export const verifyDocumentSController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const doc = await verifyDocumentService(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const updateKycStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const { status, remarks } = req.body;
    // TODO: Add role-based authorization check
    const kyc = await updateKycStatusService(req.params.id, status, remarks);
    return res.status(200).json({ success: true, data: kyc });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};








export const uploadKycDocumentController = async (req: Request, res: Response) => {
    try {
        
        const kycDocument = await uploadKycDocumentService(req.body);
        
        res.status(201).json({
            success: true,
            message: "KYC document uploaded successfully",
            data: kycDocument,
        });
    } catch (error: any) {
        logger.error("KYC Document Upload Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload KYC document",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
        

}
