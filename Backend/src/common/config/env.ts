import dotenv from "dotenv";

dotenv.config();

const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default ENV;