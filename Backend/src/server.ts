import dotenv from "dotenv";
import app from "./app.js";
import ENV from "./common/config/env.js";
import logger from "./common/logger.js";

dotenv.config();

const PORT = ENV.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
});


