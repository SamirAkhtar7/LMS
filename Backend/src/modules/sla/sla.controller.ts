import { Request, Response } from "express";
import { prisma } from "../../db/prismaService.js";
import { getAccessibleBranchIds } from "../../common/utils/branchAccess.js";

export const getSlaBreachesController = async (req: Request, res: Response) => {
    // Your controller logic here
     
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const branches = await getAccessibleBranchIds(req.user)
    const breaches = await prisma.sLABreachLog.findMany({
        where: {
            branchId: {
                in: branches ?? undefined,
            },
        },
        orderBy: {
            breachedAt: "desc",
        },
    });


  res.status(200).json({
    success: true,
    message: "SLA breaches retrieved successfully",
    data: breaches,
  });
};
