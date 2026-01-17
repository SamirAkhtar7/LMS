const generateLoanNumber = async (tx: any) => {
  const count = await tx.loanApplication.count();
  return `LN-${new Date().getFullYear()}-${String(count + 1).padStart(6, "0")}`;
};
export { generateLoanNumber };