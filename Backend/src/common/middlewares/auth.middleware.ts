import jwt, { JwtPayload } from "jsonwebtoken";
import ENV from "../config/env.js";
import logger from "../logger.js";
import { ApiError } from "../utils/apiError.js";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/handleError.js";

interface AuthPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) {
      logger.warn("Access token is missing in the request.");
      return ApiError.send(res, 401, "Access token is missing.");
    }
    const decoded = jwt.verify(
      accessToken,
      ENV.ACCESS_TOKEN_SECRET
    ) as AuthPayload;
    if (!decoded) {
      logger.warn("Invalid access token.");
      return ApiError.send(res, 401, "Invalid access token.");
    }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch (error: unknown) {
    handleError(res, error, 401, "Authentication failed.");
  }
};

export default authMiddleware;
