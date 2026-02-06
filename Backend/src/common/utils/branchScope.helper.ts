
import { prisma } from "../../db/prismaService.js";

export const getBranchScopeFilter = async (user: any) => {
  if (user.role === "SUPER_ADMIN") return {};

  if (!user.branchId) return { branch: null };

  const branch = await prisma.branch.findUnique({
    where: { id: user.branchId },
  });

  if (!branch) return { branch: null };

  if (branch.type === "MAIN") {
    const subBranches = await prisma.branch.findMany({
      where: { parentBranchId: branch.id },
      select: { id: true },
    });

    return {
      id: {
        in: [branch.id, ...subBranches.map((b: any) => b.id)],
      },
    };
  }

  return { id: branch.id };
};
