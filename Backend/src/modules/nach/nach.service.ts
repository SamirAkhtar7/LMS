import { prisma } from "../../db/prismaService.js";

export const createNachMandateService = async (data: any) => {
  const loan = await prisma.loanApplication.findUnique({
    where: {
      id: data.loanApplicationId,
    },
    include: {
      customer: true,
    },
  });

  if (!loan) throw new Error("Loan application not found");
  if (loan.status !== "active")
    throw new Error("Mandate can only be created for active loans");
  const existing = await prisma.nachMandate.findFirst({
    where: { loanApplicationId: data.loanApplicationId },
  });
  if (existing)
    throw new Error("Mandate already exists for this loan application");

  const maxDebitAmount = data.maxDebitAmount ?? data.amount;
  if (maxDebitAmount === undefined || maxDebitAmount === null) {
    throw new Error("maxDebitAmount is required");
  }

  const mandate = await prisma.nachMandate.create({
    data: {
      loanApplicationId: data.loanApplicationId,
      customerId: loan.customerId,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      maxDebitAmount,
      startDate: data.startDate,
      endDate: data.endDate,
      status: "PENDING",
    },
  });
  return mandate;
};

export const activateMandateService = async (mandateId: string) => {
  const mandate = await prisma.nachMandate.findUnique({
    where: {
      id: mandateId,
    },
  });
  if (!mandate) throw new Error("Mandate not found");
  if (mandate.status !== "PENDING")
    throw new Error("Only pending mandates can be activated");

  const update = await prisma.nachMandate.update({
    where: {
      id: mandateId,
    },
    data: {
      status: "ACTIVE",
    },
  });
  return update;
};

export const suspendMandateService = async (mandateId: string) => {
  const mandate = await prisma.nachMandate.findUnique({
    where: { id: mandateId },
  });
  if (!mandate) throw new Error("Mandate not found");
  if (mandate.status !== "ACTIVE")
    throw new Error("Only active mandates can be suspended");

  return prisma.nachMandate.update({
    where: { id: mandateId },
    data: { status: "SUSPENDED" },
  });
};

export const cancelMandateService = async (mandateId: string) => {
  const mandate = await prisma.nachMandate.findUnique({
    where: { id: mandateId },
  });
  if (!mandate) throw new Error("Mandate not found");
  if (mandate.status === "CANCELLED")
    throw new Error("Mandate is already cancelled");

  return prisma.nachMandate.update({
    where: { id: mandateId },
    data: { status: "CANCELLED" },
  });
};

export const getMandateByLoanApplicationIdService = async (
  loanApplicationId: string,
) => {
  const mandate = await prisma.nachMandate.findFirst({
    where: {
      loanApplicationId,
    },
  });
  if (!mandate) throw new Error("Mandate not found for this loan application");
  return mandate;
};
