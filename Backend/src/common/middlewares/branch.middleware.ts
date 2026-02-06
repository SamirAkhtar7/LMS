import { Request, Response, NextFunction } from "express";

import { getAccessibleBranchIds } from "../utils/branchAccess.js";


export const branchMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        if (!req.user) return next();

        const branchIds = await getAccessibleBranchIds({
            id: req.user.id,
            role: req.user.role,
            branchId: (req.user as any).branchId,
        });

        (req as any).accessibleBranchIds = branchIds;
        next();
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });

    }
}