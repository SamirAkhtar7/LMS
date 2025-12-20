import { Response } from "express";
import logger from "../logger";

class ApiError extends Error {
  static send(
    res: Response,
    statusCode: number,
    message = "Something went wrong!",
    errors: any[] = []
  ) {
    const stack =
      process.env.NODE_ENV === "development" ? new Error().stack : undefined;

    logger.error("API error %d: %s", statusCode, message, { errors, stack });

    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack,
    });
  }
}

export { ApiError };
