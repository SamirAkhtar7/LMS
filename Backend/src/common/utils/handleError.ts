import { Response } from "express";
import logger from "../logger";
import { ApiError } from "./apiError";

export const handleError = (
  res: Response,
  error: unknown,
  defaultStatus = 500,
  defaultMessage = "Something went wrong!"
) => {
  if (error instanceof Error) {
    // Log the error
    logger.error("Error occurred: %o", error);

    // Send the actual error message safely
    return ApiError.send(res, defaultStatus, error.message || defaultMessage);
  } else {
    // Handle unexpected thrown values (string, number, etc.)
    logger.error("Unknown error occurred: %o", error);
    return ApiError.send(res, defaultStatus, defaultMessage);
  }
};
