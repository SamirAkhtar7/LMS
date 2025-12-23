import { prisma } from "../../db/prismaService.js";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/utils.js";

export async function loginService(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id, user.email, user.role);

  return { user, accessToken, refreshToken };
}
