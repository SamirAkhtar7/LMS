import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { prisma } from "../../db/prismaService.js";

export const branchIsolationMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    if (!user?.branchId) {
      return res.status(403).json({ message: "User has no branch assigned" });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: user.branchId },
      include: { subBranches: true },
    });
    if (!branch) {
      return res.status(403).json({ message: "Branch not found" });
    }
    let allowedBranchIds: string[] | null = null;
    if (branch.type === "SUPER") {
      allowedBranchIds = null; // Access to all branches
    } else if (branch.type === "MAIN") {
      allowedBranchIds = [branch.id, ...branch.subBranches.map((sb) => sb.id)];
    } else {
      allowedBranchIds = [branch.id];
    }
    (req as any).allowedBranchIds = allowedBranchIds;
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
