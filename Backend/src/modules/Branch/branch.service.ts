import { prisma } from "../../db/prismaService.js";
import { getBranchScopeFilter } from "../../common/utils/branchScope.helper.js";
import { CreateBranchInput, updateBranchInput } from "./branch.types.js";

export const createBranchService = async (data: CreateBranchInput) => {
  if (data.type === "SUB" && !data.parentBranchId) {
    throw new Error("Sub branches must have a parentBranchId");
  }

  if (data.type === "MAIN" && data.parentBranchId) {
    throw new Error("Main branches cannot have a parentId");
  }
  return prisma.branch.create({
    data: {
      name: data.name,
      code: data.code,
      type: data.type,
      parentBranchId: data.parentBranchId || null,
    },
  });
};

export const updateBranchService = async (
  id: string,
  data: updateBranchInput,
) => {
  return prisma.branch.update({
    where: { id },
    data,
  });
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
  return prisma.branch.update({
    where: { id },
    data: { isActive: false },
  });
};
