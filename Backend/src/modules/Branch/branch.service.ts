import { prisma } from "../../db/prismaService.js";
import { getBranchScopeFilter } from "../../common/utils/branchScope.helper.js";
import { CreateBranchInput, updateBranchInput } from "./branch.types.js";
import { logAction } from "../../audit/audit.helper.js";
import { buildBranchFilter } from "../../common/utils/branchFilter.js";

export const createBranchService = async (
  data: CreateBranchInput,
  userId: string,
) => {
  if (data.type === "SUPER") {
    const existingSuperBranch = await prisma.branch.findFirst({
      where: { type: "SUPER" },
    });

    if (existingSuperBranch) {
      throw new Error("cannot create another Super branch");
    }
  } else {
    const superBranch = await prisma.branch.findFirst({
      where: { type: "SUPER" },
    });

    if (!superBranch) {
      throw new Error(
        "No super branch found. Please create a super branch first.",
      );
    }

    if (data.type === "MAIN") {
      data.parentBranchId = superBranch.id;
    }

    if (data.type === "SUB" && !data.parentBranchId) {
      throw new Error("Sub branches must have a parentBranchId");
    }
  }

  // Check if branch with same code already exists
  const existingBranch = await prisma.branch.findUnique({
    where: { code: data.code },
  });

  if (existingBranch) {
    throw new Error(`A branch with code '${data.code}' already exists`);
  }

  const branch = await prisma.branch.create({
    data: {
      name: data.name,
      code: data.code,
      type: data.type,
      parentBranchId: data.parentBranchId || null,
    },
  });

  await logAction({
    entityType: "BRANCH",
    entityId: branch.id,
    action: "CREATE_BRANCH",
    performedBy: userId, // In real implementation, this should be the user performing the action
    branchId: branch.id,
    oldValue: null,
    newValue: {
      name: branch.name,
      code: branch.code,
      type: branch.type,
      parentBranchId: branch.parentBranchId,
    },
  });

  return branch;
};

export const updateBranchService = async (
  id: string,
  data: updateBranchInput,
  userId: string,
) => {
  // Get the old branch data before updating
  const oldBranch = await prisma.branch.findUnique({
    where: { id },
  });

  if (!oldBranch) {
    throw new Error("Branch not found");
  }

  const branch = await prisma.branch.update({
    where: { id },
    data,
  });

  await logAction({
    entityType: "BRANCH",
    entityId: branch.id,
    action: "UPDATE_BRANCH",
    performedBy: userId,
    branchId: branch.id,
    oldValue: {
      name: oldBranch.name,
      code: oldBranch.code,
      type: oldBranch.type,
      parentBranchId: oldBranch.parentBranchId,
    },
    newValue: {
      name: branch.name,
      code: branch.code,
      type: branch.type,
      parentBranchId: branch.parentBranchId,
    },
  });

  return branch;
};

export const getBranchByIdService = async (id: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      parentBranch: true,
      subBranches: true,
    },
  });

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branch;
};

export const getAllBranchesService = async (user: any) => {
  const sope = await getBranchScopeFilter(user);

  return prisma.branch.findMany({
    where: { ...sope },
    include: {
      parentBranch: true,
      subBranches: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteBranchService = async (id: string) => {
  const branch = await prisma.branch.update({
    where: { id },
    data: { isActive: false },
  });

  await logAction({
    entityType: "BRANCH",
    entityId: branch.id,
    action: "DELETE_BRANCH",
    performedBy: "", // You should pass the userId here when calling this service
    branchId: branch.id,
    oldValue: {
      isActive: true,
    },
    newValue: {
      isActive: false,
    },
  });
};

export const getAllMainBranchesService = async () => {
  return prisma.branch.findMany({
    where: { type: "MAIN" },
  });
};
