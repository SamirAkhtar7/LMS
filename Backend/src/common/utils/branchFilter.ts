export const buildBranchFilter = (allowedBranchIds: string[] | null) => {
    console.log("Allowed Branch IDs:", allowedBranchIds);
    return allowedBranchIds ? { branchId: { in: allowedBranchIds } } : {};
}