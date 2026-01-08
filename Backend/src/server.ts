import "./types/express.js";
import dotenv from "dotenv";
import app from "./app.js";
import ENV from "./common/config/env.js";
import logger from "./common/logger.js";

// Global handlers to capture uncaught errors early
process.on("uncaughtException", (err) => {
  logger.error("uncaughtException:", err);
  // give logger time to flush
  setTimeout(() => process.exit(1), 100);
});
process.on("unhandledRejection", (reason) => {
  logger.error("unhandledRejection:", reason);
});

dotenv.config();

const PORT = ENV.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});
