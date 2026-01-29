import { Request, Response } from "express";
import { getAllCoApplicantInLoanService, reuploadCoApplicantDocumentService, uploadDocumentsService } from "./coApplicant.service.js";
import { cleanupFiles } from "../../common/utils/cleanup.js";



export const uploadCoApplicantDocumentsController = async (
  req: Request,
  res: Response,
  next: Function,
) => {
  try {
    const { coApplicantId } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = req.user.id;

    if (!req.files || !(req.files instanceof Array)) {
      return res.status(400).json({
        success: false,
        message: "No documents uploaded",
      });
    }

    const documents = req.files.map((file: Express.Multer.File) => ({
      documentType: file.fieldname, // e.g. PAN, AADHAAR, PHOTO
      documentPath: `/uploads/${file.filename}`, // public path
      uploadedBy: userId,
    }));

    const uploadedDocuments = await uploadDocumentsService(
      "coApplicant",
      coApplicantId,
      documents,
    );

    return res.status(201).json({
      success: true,
      message: "Co-applicant documents uploaded successfully",
      data: uploadedDocuments,
    });
  } catch (error: any) {
  if (req.files && req.files instanceof Array) {
    cleanupFiles(req.files); // 🧹 remove uploaded files
  }

  if (error.statusCode === 409) {
    return res.status(409).json({
      success: false,
      message: error.message,
      duplicateDocuments: error.duplicateDocs,
    });
  }

  next(error);
    };
};



export const reuploadCoApplicantDocumentController = async(
    req: Request,
    res: Response,
    next: Function,
) => {
    try {
        const { coApplicantId, documentType } = req.params;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });

        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No document uploaded",
            });
        }
        const updatedDoc = await reuploadCoApplicantDocumentService(
            coApplicantId,
            documentType,
            {
                filename: req.file.filename,
                path: req.file.path,
                uploadedBy: req.user.id,
            },
        );
        return  res.status(200).json({
            success: true,
            message: "Document re-uploaded successfully",
            data: updatedDoc,
        });

    } catch (error: any) {
        if (req.file) {

            cleanupFiles([req.file]);
        }
        next(error);
    }
};


export const getAllCoApplicantController = async(
    req: Request,
    res: Response,
    next: Function,

) => {
    try {
        const { loanApplicationId } = req.params;
        const coApplicants = await getAllCoApplicantInLoanService(loanApplicationId);
        if (coApplicants.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No co-applicants found for this loan application",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Co-applicants fetched successfully",
            data: coApplicants,
        });
    }
    catch (error: any) {
        next(error);
    }
    
}