import { Request, Response, NextFunction } from "express";
import logger from "../logger.js";

type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler =
  (requestHandler: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error: any) => {
      logger.error("Unhandled error in async handler: %o", error);
      next(error);
    });
  };

export { asyncHandler };
