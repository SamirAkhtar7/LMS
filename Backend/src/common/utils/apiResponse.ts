import logger from "../logger";

class ApiResponse {
  statusCode: number;
  message: string;
  data: any;
  success: boolean;

  constructor(statusCode: number, message = "Success", data: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;

    if (this.success) {
      logger.info("API response %d: %s", this.statusCode, this.message);
    } else {
      logger.error(
        "API response %d: %s",
        this.statusCode,
        this.message,
        this.data
      );
    }
  }
}

export { ApiResponse };
