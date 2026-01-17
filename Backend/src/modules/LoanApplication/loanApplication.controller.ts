import { Response, Request } from "express";
import {
  createLoanApplicationService,
  getAllLoanApplicationsService,
  getLoanApplicationByIdService,
  reviewLoanService,
  approveLoanService,
  rejectLoanService,
  updateLoanApplicationStatusService,
  uploadLoanDocumentsService,
  verifyDocumentService,
  rejectDocumentService,
} from "./loanApplication.service.js";
import { prisma } from "../../db/prismaService.js";

import { cleanupFiles } from "../../common/utils/cleanup.js";

export const createLoanApplicationController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const loanApplication = await createLoanApplicationService(req.body, {
      id: req.user.id,
      role: req.user.role as any,
    });

    res.status(201).json({
      success: true,
      message: "Loan application created successfully",
      data: loanApplication,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan application creation failed",
    });
  }
};

export const getAllLoanApplicationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const loanApplications = await getAllLoanApplicationsService();
    res.status(200).json({
      success: true,
      message: "Loan applications retrieved successfully",
      data: loanApplications, // return array of loan applications
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve loan applications",
    });
  }
};

export const getLoanApplicationByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const loanApplication = await getLoanApplicationByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Loan application retrieved successfully",
      data: loanApplication, // return loan application data
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve loan application",
    });
  }
};
export const updateLoanApplicationStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { id } = req.params;
    const { status } = req.body;
    const updatedLoanApplication = await updateLoanApplicationStatusService(
      id,
      { status }
    );
    res.status(200).json({
      success: true,
      message: "Loan application status updated successfully",
      data: updatedLoanApplication,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update loan application status",
    });
  }
};







export const uploadLoanDocumentsController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const loanApplicationId = req.params.id;
  const userId = req.user.id;
  const files = req.files as Express.Multer.File[];

  try {
    /* ---------------- 1️⃣ Validate files ---------------- */
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded",
      });
    }

    /* ---------------- 2️⃣ Fetch loan ---------------- */
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id: loanApplicationId },
      include: {
        kyc: true,
        loanType: true,
      },
    });

    if (!loanApplication) {
      cleanupFiles(files);
      return res.status(404).json({
        success: false,
        message: "Loan application not found",
      });
    }

    if (!loanApplication.kyc) {
      cleanupFiles(files);
      return res.status(400).json({
        success: false,
        message: "KYC not found for this application",
      });
    }

    /* ---------------- 3️⃣ Required documents check ---------------- */
    const requiredDocuments =
      loanApplication.loanType?.documentsRequired
        ?.split(",")
        .map((d) => d.trim()) || [];

    if (requiredDocuments.length === 0) {
      cleanupFiles(files);
      return res.status(400).json({
        success: false,
        message: "No documents required for this loan type",
      });
    }

    const uploadedDocTypes = files.map((file) => file.fieldname);

    const missingDocs = requiredDocuments.filter(
      (doc) => !uploadedDocTypes.includes(doc)
    );

    if (missingDocs.length > 0) {
      cleanupFiles(files);
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingDocs.join(", ")}`,
      });
    }

    /* ---------------- 4️⃣ Prevent duplicate uploads ---------------- */
    const existingDocs = await prisma.document.findMany({
      where: {
        loanApplicationId,
        documentType: {
          in: uploadedDocTypes,
        },
      },
      select: {
        documentType: true,
      },
    });

    if (existingDocs.length > 0) {
      cleanupFiles(files);
      return res.status(400).json({
        success: false,
        message: `Document(s) already uploaded: ${existingDocs
          .map((d) => d.documentType)
          .join(", ")}`,
      });
    }

    /* ---------------- 5️⃣ Build payload ---------------- */
    const documentsPayload = files.map((file) => ({
      documentType: file.fieldname,
      documentPath: file.path,
      uploadedBy: userId,
    }));

    /* ---------------- 6️⃣ Save documents ---------------- */
    const documents = await uploadLoanDocumentsService(
      loanApplicationId,
      documentsPayload,
    
    );

    return res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      data: documents,
    });
  } catch (error: any) {
    cleanupFiles(files);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Document upload failed",
    });
  }
};









export const verifyDocumentController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const documentId = req.params.id;
    const doc = await verifyDocumentService(documentId, req.user.id);
    res.status(200).json({
      success: true,
      message: "Document verified successfully",
      data: doc,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Document verification failed",
    });
  }
};

export const rejectDocumentController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const documentId = req.params.id;
    const { reason } = req.body;
    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "Rejection reason is required" });
    }
    const doc = await rejectDocumentService(documentId, reason, req.user.id);
    res.status(200).json({
      success: true,
      message: "Document rejected successfully",
      data: doc,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Document rejection failed",
    });
  }
};

export const reviewLoanController = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { id } = req.params;

    const loan = await reviewLoanService(id);

    res.status(200).json({
      success: true,
      message: "Loan moved to review stage",
      data: loan,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan review failed",
    });
  }
};

export const approveLoanController = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { id } = req.params;
    const approvedBy = req.user.id;
    const data = req.body;

    const loan = await approveLoanService(id, approvedBy, data);
 
    res.status(200).json({
      success: true,
      message: "Loan approved successfully",
      data: loan,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan approval failed",
    });
  }
};

export const rejectLoanController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const rejectedBy = req.user.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const loan = await rejectLoanService(id, reason, rejectedBy);

    res.status(200).json({
      success: true,
      message: "Loan rejected successfully",
      data: loan,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Loan rejection failed",
    });
  }
};
