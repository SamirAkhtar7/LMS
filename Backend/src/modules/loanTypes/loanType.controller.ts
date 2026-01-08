import { Request, Response } from "express";
import { createLoanTypeService, getAllLoanTypeService, getLoanTypeByIdService, softDeleteLoanTypeService, updateLoanTypeService } from "./loanTypes.service.js";




export const createLoanTypeController = async (req: Request, res: Response) => {
    try {
      
        const loanType = await createLoanTypeService( req.body );
        res.status(201).json({
            success: true,
            message: "Loan type created successfully",
            data: loanType,
        });
    }   catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to create loan type",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};


export const getAllLoanTypesController = async (req: Request, res: Response) => {
    try {
        const loanTypes = await getAllLoanTypeService();
        res.status(200).json({
            success: true,
            message: "Loan types retrieved successfully",
            data: loanTypes,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve loan types",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
};

export const getLoanTypeByIdController = async (req: Request, res: Response) => {
    // Implementation for getting a loan type by ID
    try { 
        const loanTypeId = req.params.id;

        const loanType = await getLoanTypeByIdService( loanTypeId );
        res.status(200).json({
            success: true,
            message: "Loan type retrieved successfully",
            data: loanType,
        });

    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve loan type",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
     }
};

export const updateLoanTypeController = async (req: Request, res: Response) => {
    try {
        const loanTypeId = req.params.id;
        const updateData = req.body;
        const updatedLoanType = await updateLoanTypeService( loanTypeId, updateData );
        res.status(200).json({
            success: true,
            message: "Loan type updated successfully",
            data: updatedLoanType,
        });
    }
    catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to update loan type",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
}

export const deleteLoanTypeController = async (req: Request, res: Response) => {
    try {
        const loanTypeId = req.params.id;
        const deletedByUserId = req.user?.id; // Assuming req.user is populated by auth middleware
        if (!deletedByUserId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // Assuming you have a deleteLoanTypeService function
      const result = await softDeleteLoanTypeService(loanTypeId, deletedByUserId);
        res.status(200).json({
            success: true,
            message: "Loan type deleted successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Failed to delete loan type",
            error: error.message || "INTERNAL_SERVER_ERROR",
        });
    }
}
