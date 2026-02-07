import { prisma } from "../../db/prismaService.js";
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/utils.js";

export async function loginService(identifier: string, password: string) {
  // Find by email OR userName
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { userName: identifier }],
    },
  });
  if (!user) throw new Error("Invalid credentials");
  if (!user.isActive) throw new Error("User account is inactive");
  // if (user.kycStatus !== "VERIFIED") {
  //   throw new Error("User KYC is not verified cannot login");
  // }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  //TODO remonve the undefined branchId from token if the user does not have a branchId

  const accessToken = generateAccessToken(
    user.id,
    user.email,
    user.role,
    user.branchId ?? undefined,
  );
  const refreshToken = generateRefreshToken(
    user.id,
    user.email,
    user.role,
    user.branchId ?? undefined,
  );

  return { user, accessToken, refreshToken };
}
