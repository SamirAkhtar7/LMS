import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ENV from "../config/env.js";
import logger from "../logger.js";
import { JwtPayload as JWT } from "jsonwebtoken";

export interface JwtPayload extends JWT {
  id: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | "PARTNER";
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const hashPassword = async (password: string) => {
  if (!password) throw new Error("Password is required for hashing");
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

const getSecret = (type: "ACCESS" | "REFRESH") => {
  const secret =
    type === "ACCESS" ? ENV.ACCESS_TOKEN_SECRET : ENV.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error(`${type} token secret missing in ENV`);
  return secret;
};

export const generateAccessToken = (
  id: string,
  email: string,
  role: string
) => {
  return jwt.sign({ id, email, role }, getSecret("ACCESS"), {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (
  id: string,
  email: string,
  role: string
) => {
  return jwt.sign({ id, email, role }, getSecret("REFRESH"), {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
  });
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, getSecret("REFRESH")) as JwtPayload;
  } catch (err) {
    logger.error("Failed to verify refresh token", err);
    throw err;
  }
};
