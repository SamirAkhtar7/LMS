import { Request, Response } from "express";
import {
  uploadKycDocumentService,
  verifyDocumentService,
  getMyKycService,
} from "./kyc.service.js";
import logger from "../../common/logger.js";



export const uploadKycDocumentController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const files = req.files as Record<string, Express.Multer.File[]>;
    const documents = [];

    if (files?.aadhaar_front) {
      documents.push({
        documentType: "aadhaar_front",
        documentPath: files.aadhaar_front[0].path,
      });
    }
    if (files?.aadhaar_back) {
      documents.push({
        documentType: "aadhaar_back",
        documentPath: files.aadhaar_back[0].path,
      });
    }
    if (files?.pan_card) {
      documents.push({
        documentType: "pan_card",
        documentPath: files.pan_card[0].path,
      });
    }
    if (files?.photo) {
      documents.push({
        documentType: "photo",
        documentPath: files.photo[0].path,
      });
    }

    const result = await uploadKycDocumentService({
      userId: req.user.id,
      documents,
    });

    res.status(201).json({
      success: true,
      message: "KYC document uploaded successfully",
      data: result,
    });
  } catch (error: any) {
    logger.error("KYC Document Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload KYC document",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
};



export const verifyKycController = async (
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
    
    if (error instanceof Error) {
      return res
        .status((error as any).statusCode || 500)
        .json({ success: false, message: error.message });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export const getMyKycController = async (req: Request, res: Response) => {
try {
 if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const kyc = await getMyKycService(req.user.id);

  res.json({
    success: true,
    data: kyc,
  });} catch (error: any) {
    logger.error("Get My KYC Error:", error);
    res.status(500).json({
     success: false,
     message: "Failed to fetch KYC data",
      error: error.message || "INTERNAL_SERVER_ERROR",
    });
  }
 };
