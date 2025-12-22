import { prisma } from "../../db/prismaService.js";
// no express response here; services should throw and let controllers/middleware handle responses
import { hashPassword } from "../../common/utils/utils.js";
import { CreateUser } from "./user.types.js";


export async function createUserService(data: CreateUser) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
   throw new Error("Email already exists");
  }
  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phone: data.phone,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    },
  });

  return user;
}
