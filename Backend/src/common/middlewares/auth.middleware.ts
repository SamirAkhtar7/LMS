import jwt, { JwtPayload } from "jsonwebtoken";
import ENV from "../config/env";
import logger from "../logger";
import { ApiError } from "../utils/apiError";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/handleError";

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
    ) as JwtPayload;
    if (!decoded) {
      logger.warn("Invalid access token.");
      return ApiError.send(res, 401, "Invalid access token.");
    }
    const { password, ...userWithoutPassword } = decoded 
    req.user = userWithoutPassword;
    return next();
  } catch (error: unknown) {
    handleError(res, error, 401, "Authentication failed.");
  }
};

export default authMiddleware;