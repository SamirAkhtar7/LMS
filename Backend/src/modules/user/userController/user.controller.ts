import { Request, Response } from "express";
import {
  createUserService,
  getallUsersService,
  getUserByIdService,
  updateUserService,
} from "../userServices/user.service.js";
import { ApiResponse } from "../../../common/utils/apiResponse.js";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const user = await createUserService(req.body);
    const { password: _pw, ...safeUser } = user as any;
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: safeUser,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res
      .status(400)
      .json({ success: false, message: "User creation failed", error: error });
  }
};

export const getallUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getallUsersService();
    const safe = (users as any[]).map(({ password, ...u }) => u);
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: safe,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to retrieve users",
      error: error,
    });
  }
};
export const getUserByIdController = async (req: Request, res: Response) => {
  // Implementation for getting user by ID
  try {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);
    const { password: _pw2, ...safeUser } = user as any;
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: safeUser,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(400).json({
      success: false,
      message: "Failed to retrieve user",
      error: error,
    });
  }
};
export const updateUserController = async (req: Request, res: Response) => {
  // Implementation for updating user
  try {
    const userId = req.params.id;

    const updatedUser = await updateUserService(userId, req.body);
    const { password: _pw3, ...safeUser } = updatedUser as any;
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: safeUser,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: "Failed to update user", error: error });
  }
};
