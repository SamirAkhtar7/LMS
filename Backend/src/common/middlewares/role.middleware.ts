import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";

type UserRole = "ADMIN" | "EMPLOYEE" | "PARTNER";


const roleMiddleware = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return ApiError.send(res, 401, "Unauthorized: User not authenticated.");
        }

        if(!allowedRoles.includes(req.user.role)){
            return ApiError.send(res, 403, "Access denied: Insufficient permissions.");
        }

        next();
    };
};

export default roleMiddleware;