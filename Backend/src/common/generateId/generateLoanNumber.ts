import { Prisma } from "../../../generated/prisma-client/client.js";
;
export const generateLoanNumber = async (tx: Prisma.TransactionClient) => {
  const year = new Date().getFullYear();

  let counter = await tx.loanNumberCounter.findUnique({
    where: { year },
  });

  if (!counter) {
    const lastLoan = await tx.loanApplication.findFirst({
      where: { loanNumber: { startsWith: `LN-${year}-` } },
      orderBy: { loanNumber: "desc" },
      select: { loanNumber: true },
    });

    const lastSeq = lastLoan ? Number(lastLoan.loanNumber.split("-").pop()) : 0;

    counter = await tx.loanNumberCounter.create({
      data: { year, sequence: lastSeq },
    });
  }

  const updated = await tx.loanNumberCounter.update({
    where: { year },
    data: { sequence: { increment: 1 } },
  });

  return `LN-${year}-${String(updated.sequence).padStart(6, "0")}`;
};
