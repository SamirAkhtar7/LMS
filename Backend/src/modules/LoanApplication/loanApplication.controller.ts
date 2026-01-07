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
} from "./loanApplication.service.js";


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
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const loanApplicationId = req.params.id;
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};
    const documents = [];
    if (files?.aadhaar_front) {
      documents.push({
        documentType: "AADHAAR_FRONT",
        documentPath: files.aadhaar_front[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.aadhaar_back) {
      documents.push({
        documentType: "AADHAAR_BACK",
        documentPath: files.aadhaar_back[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.pan_card) {
      documents.push({
        documentType: "PAN_CARD",
        documentPath: files.pan_card[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.voter_id) {
      documents.push({
        documentType: "VOTER_ID",
        documentPath: files.voter_id[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.salary_slip) {
      documents.push({
        documentType: "SALARY_SLIP",
        documentPath: files.salary_slip[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.bank_statement) {
      documents.push({
        documentType: "BANK_STATEMENT",
        documentPath: files.bank_statement[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.photo) {
      documents.push({
        documentType: "PHOTO",
        documentPath: files.photo[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.signature) {
      documents.push({
        documentType: "SIGNATURE",
        documentPath: files.signature[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.passport) {
      documents.push({
        documentType: "PASSPORT",
        documentPath: files.passport[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (files?.other) {
      documents.push({
        documentType: "OTHER",
        documentPath: files.other[0].path,
        uploadedBy: req.user.id,
      });
    }
    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid documents uploaded",
      });
    }
    const result = await uploadLoanDocumentsService(
      loanApplicationId,
      documents,
      req.user.id
    );
    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
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

    const loan = await approveLoanService(id, approvedBy);

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
