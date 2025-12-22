import { Request, Response } from "express";
import { createUserService } from "./user.service.js";

export const createUserController = async (req: Request, res: Response) => {

  try {
    const user = await createUserService(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        data: user,
      });
  } catch (error: any) {
    if(error.message && error.message.includes("already exists")) {
      return res
      .status(409)
      .json({ success: false, message: error.message });
    }
    res
      .status(400)
      .json({ success: false, message: "User creation failed", error: error });
  }
};
