import { prisma } from "../../../db/prismaService.js";
// no express response here; services should throw and let controllers/middleware handle responses
import { hashPassword } from "../../../common/utils/utils.js";
import { CreateUser } from "../user.types.js";
import e from "express";

export async function createUserService(data: CreateUser) {
  //TODO: Only ADMIN can create users - enforce this in controller/middleware
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
      contactNumber: data.contactNumber,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    },
  });

  return user;
}

export async function getUserByIdService(id: string) {
  //TODO: Only ADMIN or the user themselves can get user by ID - enforce this in controller/middleware
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function getallUsersService() {
  //TODO: Only ADMIN can get all users - enforce this in controller/middleware
  const users = await prisma.user.findMany();
  return users;
}

export async function updateUserService(id: string, data: Partial<CreateUser>) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found");
  }

  // Remove role from update payload
  const { role, ...allowedData } = data;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...allowedData,
      password: allowedData.password
        ? await hashPassword(allowedData.password)
        : user.password,
    },
  });

  return updatedUser;
}
