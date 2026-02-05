import { Request, Response } from 'express';
import {
    createBranchService,
    getAllBranchesService,
    getBranchByIdService,
    updateBranchService,
    deleteBranchService
} from './branch.service.js';



export const createBranchController = async (req: Request, res: Response) => {
    try {
        const branch = await createBranchService(req.body);
        res.status(201).json({
            success: true,
            message: 'Branch created successfully',
            data: branch,
        });
    }
    catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}


export const updateBranchController = async (req: Request, res: Response) => {
    try {
        const branch = await updateBranchService(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Branch updated successfully',
            data: branch,
        });

    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });

    }
}

export const getAllBranchesController = async (req: Request, res: Response) => {
        try {
            const branches = await getAllBranchesService((req as any).user);
            res.status(200).json({
                success: true,
                message: 'Branches retrieved successfully',
                data: branches,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
        }
}


export const deleteBranchController = async (req: Request, res: Response) => {
    try {
        await deleteBranchService(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Branch deleted successfully',
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}


export const getBranchByIdController = async (req: Request, res: Response) => {
  try {
    const branch = await getBranchByIdService(req.params.id);
    res.status(200).json({
      success: true,
      message: "Branch retrieved successfully",
      data: branch,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
