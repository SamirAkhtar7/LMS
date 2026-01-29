import { prisma } from "../../db/prismaService.js";

export const assignPermissionsService = async (
  userId: string,
  permissionCodes: string[]
) => {
  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const e: any = new Error("User not found");
    e.statusCode = 404;
    throw e;
  }
  // Assign permissions
  const permissions = await (prisma as any).permission.findMany({
    where: {
      code: { in: permissionCodes },
    },
  });

  if (permissions.length !== permissionCodes.length) {
    const e: any = new Error("One or more permissions not found");
    e.statusCode = 404;
    throw e;
  }
  const result = await prisma.$transaction(
    permissions.map((permission: any) =>
      (prisma as any).userPermission.upsert({
        where: {
          userId_permissionId: {
            userId,
            permissionId: permission.id,
          },
        },
        update: { allowed: true },
        create: {
          userId,
          permissionId: permission.id,
          allowed: true,
        },
      })
    )
  );

  return result;
};

export const createPermissionsService = async (permissionData: {
  code: string;
  name: string;
}) => {
  try {
    const permission = await (prisma as any).permission.create({
      data: {
        code: permissionData.code,
        name: permissionData.name,
      },
    });

    return permission;
  } catch (error) {
    throw error;
  }
};

export const getUserPermissionsService = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const e: any = new Error("User not found");
    e.statusCode = 404;
    throw e;
  }

  const userPermissions = await (prisma as any).userPermission.findMany({
    where: { userId },
    include: { permission: true },
  });

  return userPermissions.map((up: any) => ({
    id: up.id,
    permissionId: up.permissionId,
    code: up.permission?.code,
    name: up.permission?.name,
    allowed: up.allowed,
  }));
};


export const getAllPermissionsCodeAndNameService = async () => {
  const permissions = await prisma.permission.findMany({
    select: {
      code: true,
      name: true,
    },
  });
  return permissions;
}