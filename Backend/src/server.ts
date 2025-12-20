import dotenv from "dotenv";
import app from "./app";
import ENV from "./common/config/env";
import logger from "./common/logger";

dotenv.config();

const PORT = ENV.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});

server.on("error", (err) => {
  logger.error("Server failed to start:", err);
});
