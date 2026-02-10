import { Request, Response } from "express";

import {
  createBranchAdminService,
  updateBranchAdminService,
} from "./branchAdmin.service.js";

export const createBranchAdminController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const branchAdmin = await createBranchAdminService(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Branch admin created successfully",
      data: branchAdmin,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to create branch admin",
    });
  }
};

export const updateBranchAdminController = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedBranchAdmin = await updateBranchAdminService(
      id,
      req.body,
      req.user.id,
    );
    res.status(200).json({
      success: true,
      message: "Branch admin updated successfully",
      data: updatedBranchAdmin,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to update branch admin",
    });
  }
};
