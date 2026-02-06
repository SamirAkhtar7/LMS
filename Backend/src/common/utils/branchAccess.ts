import { prisma } from "../../db/prismaService.js";

export const getAccessibleBranchIds = async (user: {
  id: string;
  role: string;
  branchId?: string;
}) => {
  //superAdmin can access all branches
  if (user.role === "SUPER_ADMIN") {
    return null; // null means no filter, access to all branches
  }
    // user Role is EMPLOYEE or ADMIN, we need to check their branch access
if (user.role === "EMPLOYEE") {
  if (!user.branchId) {
    throw new Error("Employee is not mapped to any branch");
  }

  return [user.branchId];
}

    
    
  if (!user.branchId) {
    throw new Error("User does not have an associated branch");
  }
  const userBranch = await prisma.branch.findUnique({
    where: { id: user.branchId },
    include: {
      subBranches: true,
    },
  });

  if (!userBranch) {
    throw new Error("User's branch not found");
  }

  if (userBranch.type === "MAIN") {
    const subBranchIds = userBranch.subBranches.map((sb) => sb.id);
    return [user.branchId, ...subBranchIds];
    }
    
  // If it's a sub branch, they can only access their own branch
  return [user.branchId];
};
