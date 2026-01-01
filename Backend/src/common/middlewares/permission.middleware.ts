import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { prisma } from "../../db/prismaService.js";

export const checkPermissionMiddleware = (permissionCode: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { id, role } = req.user;
      if (role === "admin") {
        return next();
      }

      const permission = await prisma.userPermission.findMany({
        where: {
          userId: id,
          allowed: true,
          permission: {
            code: permissionCode,
          },
        },
        include: {
          permission: true,
        },
      });

      if (permission.length === 0) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Forbidden: Insufficient permissions",
          });
      }

      next();
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  };
};
