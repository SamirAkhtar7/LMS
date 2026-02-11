import { Request, Response } from "express";
import { prisma } from "../../db/prismaService.js";
import { getAccessibleBranchIds } from "../../common/utils/branchAccess.js";

export const getSlaBreachesController = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const branches = await getAccessibleBranchIds(req.user);

    if (!branches || branches.length === 0) {
      return res.status(200).json({
        success: true,
        message: "SLA breaches retrieved successfully",
        data: [],
      });
    }

    const breaches = await prisma.sLABreachLog.findMany({
      where: {
        branchId: {
          in: branches,
        },
      },
      orderBy: {
        breachedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "SLA breaches retrieved successfully",
      data: breaches,
    });
  } catch (error) {
    console.error("Error fetching SLA breaches:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve SLA breaches",
    });
  }
};
