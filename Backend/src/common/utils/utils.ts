import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config/env";
import logger from "../logger";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const hashPassword = async (password: string) => {
  if (!password) {
    logger.error("Password is required for hashing.");
    throw new Error("Password is required for hashing.");
  }
  logger.debug("Hashing password...");
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  logger.debug("Comparing password.");
  return await bcrypt.compare(password, hashedPassword);
};

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateAccessToken = (
  id: string,
  email: string,
  role: string
) => {
  const secret = ENV.ACCESS_TOKEN_SECRET;
  if (!secret) {
    logger.error("JWT secret key is missing in environment variables.");
    throw new Error("JWT secret key is missing in environment variables.");
  }

  const payload: JwtPayload = {
    id,
    email,
    role,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRY,
  });
  logger.debug("Generated access token for id %s", id);
  return token;
};


export const generateRefreshToken = (
  id: string,
  email: string,
  role: string
) => {
  const secret = ENV.REFRESH_TOKEN_SECRET;
  if (!secret) {
    logger.error("JWT refresh secret key is missing in environment variables.");
    throw new Error(
      "JWT refresh secret key is missing in environment variables."
    );
  }
  const payload: JwtPayload = {
    id,
    email,
    role,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
  });
  logger.debug("Generated refresh token for id %s", id);
  return token;
};

export const verifyRefreshToken = (token: string) => {
  const secret = ENV.REFRESH_TOKEN_SECRET;
  if (!secret) {
    logger.error("JWT refresh secret key is missing in environment variables.");
    throw new Error(
      "JWT refresh secret key is missing in environment variables."
    );
  }
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    logger.debug(
      "Refresh token verified for id %s",
      (payload && payload.id) || "unknown"
    );
    return payload;
  } catch (err) {
    logger.error("Failed to verify refresh token: %o", err);
    throw err;
  }
};
