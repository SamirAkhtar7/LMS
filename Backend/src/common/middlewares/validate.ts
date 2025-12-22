import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const validationResultMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {  
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return ApiError.send(res, 400, "Validation Error", errors.array());
    }
    next();
};
