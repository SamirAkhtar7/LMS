import { Request, Response, NextFunction } from "express";
import { handleError } from "../utils/handleError.js";

// Express error-handling middleware
const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status =
    typeof (err as any)?.statusCode === "number"
      ? (err as any).statusCode
      : 500;
  const message = err instanceof Error ? err.message : "Something went wrong!";
  return handleError(res, err, status, message);
};

export default errorMiddleware;
