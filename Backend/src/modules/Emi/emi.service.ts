import { prisma } from "../../db/prismaService.js";
import { calculateEmi } from "../../common/utils/emi.util.js";
import {
  EmiScheduleItem,
  EmiScheduleInput,
} from "../LoanApplication/loanApplication.types.js";
import { lte } from "zod";

export const generateEmiScheduleService = async (loanId: string) => {
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanId },
    select: {
      id: true,
      approvedAmount: true,
      requestedAmount: true,
      interestRate: true,
      tenureMonths: true,
      interestType: true,
      emiStartDate: true,
      // removed emiStartingCycleDate
      status: true,
      latePaymentFeeType: true,
      latePaymentFee: true,
      bounceCharges: true,
      loanType: {
        select: {
          latePaymentFeeType: true,
          latePaymentFee: true,
          bounceCharges: true,
        },
      },
    },
  });
  if (
    !loan ||
    !loan.approvedAmount ||
    !loan.interestRate ||
    !loan.tenureMonths ||
    loan.status !== "approved"
  ) {
    throw new Error("Invalid loan data for EMI schedule generation");
  }

  const principal = loan.approvedAmount ?? loan.requestedAmount;
  const tenureMonths = loan.tenureMonths!;
  const annualRate = loan.interestRate;
  const monthlyRate = annualRate / 12 / 100;

  const emi = [];

  let balance = principal;
  let emiAmount: number;

  const startDate = loan.emiStartDate ?? new Date();

  const latePaymentFeeType = (loan.latePaymentFeeType ??
    loan.loanType?.latePaymentFeeType) as any;

  const latePaymentFee =
    loan.latePaymentFee ?? loan.loanType?.latePaymentFee ?? 0;

  const bounceCharges = loan.bounceCharges ?? loan.loanType?.bounceCharges ?? 0;

  if (loan.interestType === "FLAT") {
    const totalInterest = (principal * annualRate * (tenureMonths / 12)) / 100;
    emiAmount = (principal + totalInterest) / tenureMonths;
  } else {
    emiAmount =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  }

  for (let i = 1; i <= tenureMonths; i++) {
    const interestAmount = balance * monthlyRate;
    const principalAmount = emiAmount - interestAmount;
    const closingBalance = balance - principalAmount;

    emi.push({
      loanApplicationId: loan.id,
      emiStartDate: startDate,
      emiNo: i,
      dueDate: new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        startDate.getDate()
      ),
      openingBalance: Number(balance.toFixed(2)),
      principalAmount: Number(principalAmount.toFixed(2)),
      interestAmount: Number(interestAmount.toFixed(2)),
      emiAmount: Number(emiAmount.toFixed(2)),
      closingBalance:
        closingBalance < 0 ? 0 : Number(closingBalance.toFixed(2)),
      latePaymentFeeType,
      latePaymentFee,
      bounceCharges,
    });

    balance = closingBalance;
  }

  //remove any existing schedule for this loan to avoid duplicates
  await prisma.loanEmiSchedule.deleteMany({
    where: { loanApplicationId: loanId },
  });

  await prisma.loanEmiSchedule.createMany({
    data: emi,
  });

  return emi;
};

export const getLoanEmiService = async (loanId: string) => {
  try {
    const emis = await prisma.loanEmiSchedule.findMany({
      where: { loanApplicationId: loanId },
      orderBy: { emiNo: "asc" },
    });
    return emis;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch EMI schedule");
  }
};

export const markEmiPaidService = async ({
  emiId,
  amountPaid,
  paymentMode,
  isBounce = false,
}: {
  emiId: string;
  amountPaid: number;
  paymentMode: string;
  isBounce?: boolean;
}) => {
  const emi = await prisma.loanEmiSchedule.findUnique({
    where: { id: emiId },
  });

  if (!emi) {
    throw new Error("Invalid EMI ID");
  }

  if (emi.status === "paid") {
    throw new Error("EMI already paid");
  }

  const paymentDate = new Date();

  /* ---------------- Late Fee ---------------- */
  let lateFee = 0;

  if (paymentDate > emi.dueDate) {
    if (emi.latePaymentFeeType === "FIXED") {
      lateFee = emi.latePaymentFee;
    } else {
      lateFee = (emi.emiAmount * emi.latePaymentFee) / 100;
    }
  }

  /* ---------------- Bounce Charges ---------------- */
  const bounceCharge = isBounce ? emi.bounceCharges : 0;

  /* ---------------- Final Payable ---------------- */
  const totalPayable = emi.emiAmount + lateFee + bounceCharge;

  const newPaidAmount = (emi.emiPaymentAmount ?? 0) + amountPaid;

  const status = newPaidAmount >= totalPayable ? "paid" : emi.status;

  /* ---------------- DB Transaction ---------------- */
  return await prisma.$transaction(async (tx) => {
    await tx.emiPayment.create({
      data: {
        emiScheduleId: emi.id,
        amount: amountPaid,
        paymentDate,
        paymentMode: String(paymentMode).toLowerCase() as any,
      },
    });

    return tx.loanEmiSchedule.update({
      where: { id: emiId },
      data: {
        emiPaymentAmount: newPaidAmount,
        latePaymentFee: lateFee,
        bounceCharges: bounceCharge,
        status,
        paidDate: status === "paid" ? paymentDate : null,
      },
    });
  });
};

export const getEmiAmountService = async ({
  principal,
  annualInterestRate,
  tenureMonths,
  interestType,
}: {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
  interestType: "FLAT" | "REDUCING";
}) => {
  const { emi, totalPayable } = calculateEmi({
    principal,
    annualInterestRate,
    tenureMonths,
    interestType,
  });
  return { emiAmount: emi, totalPayable };
};

export const processOverdueEmis = async (): Promise<number> => {
  const today = new Date();

  /* 1️⃣ Fetch ONLY pending EMIs that crossed due date */
  const overdueEmis = await prisma.loanEmiSchedule.findMany({
    where: {
      status: "pending", // 🔒 prevents re-processing
      dueDate: {
        lt: today,
      },
    },
    select: {
      id: true,
      emiAmount: true,
      latePaymentFeeType: true,
      latePaymentFee: true,
    },
  });

  if (overdueEmis.length === 0) return 0;

  /* 2️⃣ Update safely in one transaction */
  await prisma.$transaction(
    overdueEmis.map((emi) => {
      const lateFee =
        emi.latePaymentFeeType === "FIXED"
          ? emi.latePaymentFee ?? 0
          : (emi.emiAmount * (emi.latePaymentFee ?? 0)) / 100;

      return prisma.loanEmiSchedule.update({
        where: {
          id: emi.id,
          status: "pending", // 🔐 extra safety condition
        },
        data: {
          status: "overdue",
          latePaymentFee: lateFee,
        },
      });
    })
  );

  return overdueEmis.length;
};

export const payEmiService = async (
  emiId: string,
  amount: number,
  paymentMode: string
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const emi = await tx.loanEmiSchedule.findUnique({
        where: { id: emiId },
      });
      if (!emi) {
        throw new Error("EMI not found");
      }
      const totalDue =
        emi.emiAmount + (emi.latePaymentFee ?? 0) + (emi.bounceCharges ?? 0);

      const paidSoFar = emi.emiPaymentAmount ?? 0;
      const newPaid = paidSoFar + amount;
      await tx.emiPayment.create({
        data: {
          emiScheduleId: emiId,
          amount,
          paymentDate: new Date(),
          paymentMode: paymentMode as any,
        },
      });

      await tx.loanEmiSchedule.update({
        where: { id: emiId },
        data: {
          emiPaymentAmount: newPaid,
          status: newPaid >= totalDue ? "paid" : emi.status,
          paidDate: newPaid >= totalDue ? new Date() : emi.paidDate,
        },
      });
    });
  } catch (error: any) {
    throw new Error(error.message || "Failed to process EMI payment");
  }
};

export const forecloseLoanService = async (loanId: string) => {
  try {
    const loan = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!loan) {
      throw new Error("Loan application not found");
    }

    const emis = await prisma.loanEmiSchedule.findMany({
      where: {
        loanApplicationId: loanId,
        status: { in: ["pending", "overdue"] },
      },
    });
    const outstandingPrincipal = emis.reduce(
      (sum, e) => sum + e.principalAmount,
      0
    );
    const foreclosureCharge =
      outstandingPrincipal * ((loan.foreclosureCharges ?? 0) / 100);

    const totalPayable = (outstandingPrincipal + foreclosureCharge).toFixed(2);

    return { outstandingPrincipal, foreclosureCharge, totalPayable };
  } catch (error: any) {
    throw new Error(error.message || "Failed to foreclose loan");
  }
};

export const getThisMonthEmiAmountService = async (
  loanApplicationId: string
) => {
  /* 1️⃣ Get current month range */
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  /* 2️⃣ Find EMI strictly in current month */
  const emi = await prisma.loanEmiSchedule.findFirst({
    where: {
      loanApplicationId,
      status: {
        in: ["pending", "overdue"],
      },
      dueDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  if (!emi) {
    throw new Error("No EMI due for this month");
  }

  const today = new Date();
  const isOverdue = today > emi.dueDate;

  /* 3️⃣ Late fee */
  let lateFee = 0;
  if (isOverdue) {
    lateFee =
      emi.latePaymentFeeType === "FIXED"
        ? emi.latePaymentFee ?? 0
        : (emi.emiAmount * (emi.latePaymentFee ?? 0)) / 100;
  }

  const bounceCharge = emi.bounceCharges ?? 0;
  const alreadyPaid = emi.emiPaymentAmount ?? 0;

  const totalPayable = emi.emiAmount + lateFee + bounceCharge - alreadyPaid;

  return {
    emiId: emi.id,
    emiNo: emi.emiNo,
    dueDate: emi.dueDate,
    emiAmount: Number(emi.emiAmount.toFixed(2)),
    lateFee: Number(lateFee.toFixed(2)),
    bounceCharge: Number(bounceCharge.toFixed(2)),
    alreadyPaid: Number(alreadyPaid.toFixed(2)),
    totalPayable: Number(Math.max(totalPayable, 0).toFixed(2)),
    status: emi.status,
    isOverdue,
  };
};

export const payforecloseLoanService = async (
  loanApplicationId: string,
  data: any
) => {
  try {
    const loan = await prisma.loanApplication.findUnique({
      where: { id: loanApplicationId },
    });
    if (!loan) {
      throw new Error("Loan application not found");
    }

    const emis = await prisma.loanEmiSchedule.findMany({
      where: {
        loanApplicationId: loanApplicationId,
        status: { in: ["pending", "overdue"] },
      },
    });
    const outstandingPrincipal = emis.reduce(
      (sum, e) => sum + e.principalAmount,
      0
    );
    const foreclosureCharge =
      outstandingPrincipal * ((loan.foreclosureCharges ?? 0) / 100);

    const totalPayable = (outstandingPrincipal + foreclosureCharge).toFixed(2);

    if (data.amountPaid <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }
    if (data.amountPaid < totalPayable) {
      throw new Error("Insufficient amount to foreclose the loan");
    }

    if (data.amountPaid == totalPayable) {
      // Mark all pending EMIs as paid
      await prisma.$transaction(async (tx) => {
        for (const emi of emis) {
          await tx.loanEmiSchedule.update({
            where: { id: emi.id },
            data: {
              status: "paid",
              paidDate: new Date(),
              emiPaymentAmount: emi.emiAmount,
            },
          });
        }
      });
    }

    //check remaining amount after foreclosure
    await prisma.loanApplication.update({
      where: { id: loanApplicationId },
      data: {
        status: "closed",
        foreclosureDate: new Date(),
      },
    });
    return { outstandingPrincipal, foreclosureCharge, totalPayable };
  } catch (error: any) {
    throw new Error(error.message || "Failed to foreclose loan");
  }
};

export const applyMoratoriumService = async ({
  loanId,
  type,
  startDate,
  endDate,
}: {
  loanId: string;
  type: "FULL" | "INTEREST_ONLY";
  startDate: Date;
  endDate: Date;
}) => {
  // Fetch EMIs within moratorium period
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanId },
    include: { emis: true },
  });

  if (!loan) {
    throw new Error("Loan application not found");
  }

  if (loan.status !== "approved") {
    throw new Error("Moratorium can be applied only on approved loans");
  }

  const overlapping = await prisma.emiMoratorium.findFirst({
    where: {
      loanApplicationId: loanId,
      status: "active",
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      ],
    },
  });

  if (overlapping) {
    throw new Error(
      "An active moratorium already exists for this loan in the specified period"
    );
  }

  const futureEmis = await prisma.loanEmiSchedule.findMany({
    where: {
      loanApplicationId: loanId,
      status: "pending",
      dueDate: { gte: startDate },
    },
    orderBy: { emiNo: "asc" },
  });

  if (futureEmis.length === 0) {
    throw new Error("No pending EMIs found for moratorium application");
  }

  const moratorium = await prisma.emiMoratorium.create({
    data: {
      loanApplicationId: loanId,
      type,
      startDate,
      endDate,
      status: "active",
    },
  });
  return { message: "Moratorium applied successfully", moratorium };
};
