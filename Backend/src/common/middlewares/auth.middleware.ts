import jwt, { JwtPayload } from "jsonwebtoken";
import ENV from "../config/env.js";
import logger from "../logger.js";
import { ApiError } from "../utils/apiError.js";
import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/handleError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  cookieOptions,
} from "../utils/utils.js";
import { prisma } from "../../db/prismaService.js";

interface AuthPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  branchId?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    branchId?: string;
  };
  permissions?: string[];
}
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // 1️⃣ Try access token
    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          ENV.ACCESS_TOKEN_SECRET,
        ) as AuthPayload;

        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };

        // Fetch branchId from User table
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { branchId: true },
        });
        if (user?.branchId) {
          req.user.branchId = user.branchId;
        }

        // For employees, also check Employee table
        if (decoded.role === "EMPLOYEE") {
          const employee = await prisma.employee.findUnique({
            where: { userId: decoded.id },
            select: { branchId: true },
          });
          if (employee) {
            req.user.branchId = employee.branchId;
          }
        }

        // expose tokens to downstream handlers/controllers if needed
        // (req as any).accessToken = accessToken;
        // (req as any).refreshToken = req.cookies?.refreshToken;

        return next();
      } catch (err: any) {
        if (err.name !== "TokenExpiredError") {
          logger.warn("Invalid access token");
          return ApiError.send(res, 401, "Invalid access token");
        }
      }
    }

    // 2️⃣ Try refresh token (COOKIE ONLY)
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return ApiError.send(res, 401, "Authentication required");
    }

    let decodedRefresh: AuthPayload;

    try {
      decodedRefresh = verifyRefreshToken(refreshToken) as AuthPayload;
    } catch {
      return ApiError.send(res, 401, "Invalid refresh token");
    }

    req.user = {
      id: decodedRefresh.id,
      email: decodedRefresh.email,
      role: decodedRefresh.role,
    };

    // Fetch branchId from User table
    const user = await prisma.user.findUnique({
      where: { id: decodedRefresh.id },
      select: { branchId: true },
    });
    if (user?.branchId) {
      req.user.branchId = user.branchId;
    }

    // For employees, also check Employee table
    if (decodedRefresh.role === "EMPLOYEE") {
      const employee = await prisma.employee.findUnique({
        where: { userId: decodedRefresh.id },
        select: { branchId: true },
      });
      if (employee) {
        req.user.branchId = employee.branchId;
      }
    }

    // 3️⃣ Generate new tokens with branchId
    const newAccess = generateAccessToken(
      decodedRefresh.id,
      decodedRefresh.email,
      decodedRefresh.role,
      req.user.branchId,
    );

    const newRefresh = generateRefreshToken(
      decodedRefresh.id,
      decodedRefresh.email,
      decodedRefresh.role,
      req.user.branchId,
    );

    // 4️⃣ Set cookies
    res.cookie("accessToken", newAccess, cookieOptions);
    res.cookie("refreshToken", newRefresh, cookieOptions);

    // expose the freshly generated tokens on the request for controllers that may want them
    // (req as any).accessToken = newAccess;
    // (req as any).refreshToken = newRefresh;

    return next();
  } catch (error) {
    return handleError(res, error, 401, "Authentication failed");
  }
};
