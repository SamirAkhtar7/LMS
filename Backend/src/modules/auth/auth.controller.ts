import { Request, Response } from "express";
import { loginService } from "./auth.service.js";
import { cookieOptions } from "../../common/utils/utils.js";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginService(
      email,
      password
    );

    const { password: _pw, ...safeUser } = user as any;
    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({ success: true, message: "Login successful", data: safeUser });
  } catch (error: any) {
    if (error.message && error.message.includes("Invalid credentials")) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    res.status(400).json({ success: false, message: "Login failed", error });
  }
};
