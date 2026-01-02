import { Request, Response } from 'express';
import { updateKycStatusService, uploadKycDocumentService, verifyDocumentService } from './kyc.service.js';





export const uploadKycDocumentController = async (req: Request, res: Response) => {
    try {
        if(!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const doc = await uploadKycDocumentService({
            kycId: req.body.kycId,
            documentType: req.body.documentType,
            documentPath: req.file.path,
            uploadedBy: req.user.id

        });
        return res.status(201).json({success: true, data: doc});
    } catch (error) {
        return res.status(500).json({success: false, message: "Internal Server Error"});
    }
}

export const verifyDocumentSController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const doc = await verifyDocumentService(req.params.id, req.user.id);
        return res.status(200).json({success: true, data: doc});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const updateKycStatusController = async (req: Request, res: Response) => {
    try {
        const {status, remarks } = req.body;
        const kyc = await updateKycStatusService(req.params.id, status, remarks);
        return res.status(200).json({success: true, data: kyc});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
