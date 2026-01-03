import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { prisma } from "../../db/prismaService.js";
import logger from "../logger.js";

export const checkPermissionMiddleware = (permissionCode: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { id, role } = req.user;
      if (role === "ADMIN") {
        return next();
      }
      const permission = await prisma.userPermission.findFirst({
        where: {
          userId: id,
          allowed: true,
          permission: {
            code: permissionCode,
          },
        },
      });
      if (!permission) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Insufficient permissions",
        });
      }

      return next();
    } catch (error) {
      logger.error("Permission check error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }    }
  };
