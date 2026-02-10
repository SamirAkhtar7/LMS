import { prisma } from "../../db/prismaService.js";

import { hashPassword } from "../../common/utils/utils.js";
import { logAction } from "../../audit/audit.helper.js";
import logger from "../../common/logger.js";

export const createBranchAdminService = async (
  data: {
    fullName: string;
    email: string;
    userName: string;
    contactNumber: string;
    password: string;
    branchId: string;
  },
  userId: string,
) => {
  try {
    // Verify branch exists and is active
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    if (!branch || !branch.isActive) {
      const error: any = new Error("Branch not found or inactive");
      error.statusCode = 400;
      throw error;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      const error: any = new Error("User with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    // Check if userName already exists
    const existingUserName = await prisma.user.findUnique({
      where: { userName: data.userName },
    });
    if (existingUserName) {
      const error: any = new Error("Username already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        userName: data.userName,
        contactNumber: data.contactNumber,
        password: hashedPassword,
        role: "ADMIN",
        branchId: data.branchId,
        isActive: true,
      },
    });

    // Log audit trail
    await logAction({
      entityType: "BRANCH_ADMIN",
      entityId: user.id,
      action: "CREATE_BRANCH_ADMIN",
      performedBy: userId,
      branchId: data.branchId,
      oldValue: null,
      newValue: {
        fullName: user.fullName,
        email: user.email,
        userName: user.userName,
        contactNumber: user.contactNumber,
        branchId: user.branchId,
        role: user.role,
        isActive: user.isActive,
      },
      remarks: `Branch admin created for branch ${branch.name}`,
    });

    // Return user without password
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  } catch (error: any) {
    logger.error("Error creating branch admin:", {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
    });

    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Failed to create branch admin";
    }
    throw error;
  }
};

export const updateBranchAdminService = async (
  id: string,
  data: {
    fullName?: string;
    email?: string;
    userName?: string;
    contactNumber?: string;
    password?: string;
    branchId?: string;
  },
  userId: string,
) => {
  let updatedBranchName: string | null = null;
  try {
    // Fetch existing user
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    if (!existingUser || existingUser.role !== "ADMIN") {
      const error: any = new Error("Branch admin user not found");
      error.statusCode = 404;
      throw error;
    }

    // Validate branch if being updated
    if (data.branchId && data.branchId !== existingUser.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: data.branchId },
      });
      if (!branch || !branch.isActive) {
        const error: any = new Error("Branch not found or inactive");
        error.statusCode = 400;
        throw error;
      }
       updatedBranchName = branch.name;
    }

    // Validate email uniqueness
    if (data.email && data.email !== existingUser.email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmailUser) {
        const error: any = new Error("User with this email already exists");
        error.statusCode = 409;
        throw error;
      }
    }

    // Validate userName uniqueness
    if (data.userName && data.userName !== existingUser.userName) {
      const existingUserName = await prisma.user.findUnique({
        where: { userName: data.userName },
      });
      if (existingUserName) {
        const error: any = new Error("Username already exists");
        error.statusCode = 409;
        throw error;
      }
    }

    // Hash password if provided
    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    } else {
      delete updateData.password;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Log audit trail
    const auditBranchId = data.branchId ?? existingUser.branchId;
    await logAction({
      entityType: "BRANCH_ADMIN",
      entityId: updatedUser.id,
      action: "UPDATE_BRANCH_ADMIN",
      performedBy: userId,
      branchId: auditBranchId,
      oldValue: {
        fullName: existingUser.fullName,
        email: existingUser.email,
        userName: existingUser.userName,
        contactNumber: existingUser.contactNumber,
        branchId: existingUser.branchId,
        role: existingUser.role,
        isActive: existingUser.isActive,
      },
      newValue: {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        userName: updatedUser.userName,
        contactNumber: updatedUser.contactNumber,
        branchId: updatedUser.branchId,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
      remarks: updatedBranchName
        ? `Branch admin updated and moved to ${updatedBranchName}`
        : "Branch admin updated",
    });

    // Return user without password
    const { password: _pw, ...safeUser } = updatedUser;
    return safeUser;
  } catch (err: any) {
    logger.error("Error updating branch admin:", {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Failed to update branch admin";
    }
    throw err;
  }
};
