import { prisma } from "../../db/prismaService.js";
import { calculateEmi } from "../../common/utils/emi.util.js";
import {
  EmiScheduleItem,
  EmiScheduleInput,
} from "../LoanApplication/loanApplication.types.js";
import { getPagination } from "../../common/utils/pagination.js";
import { Prisma } from "../../../generated/prisma-client/client.js";
import { buildEmiSearch } from "../../common/utils/search.js";

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
    if (loan && loan.status == "active") {
      throw new Error("EMI schedule already generated");
    }
    throw new Error(
      "Invalid loan data for EMI schedule can be generated only for approved loans",
    );
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
        startDate.getDate(),
      ),
      openingBalance: Number(balance.toFixed(2)),
      principalAmount: Number(principalAmount.toFixed(2)),
      interestAmount: Number(interestAmount.toFixed(2)),
      emiAmount: Number(emiAmount.toFixed(2)),
      closingBalance:
        closingBalance < 0 ? 0 : Number(closingBalance.toFixed(2)),
      totalPayableAmount: Number(emiAmount.toFixed(2)), // Add this field
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

  await prisma.loanApplication.update({
    where: { id: loanId },
    data: { status: "active" },
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

export const getAllEmisService = async (params: {
  loanId?: string;
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}) => {
  const { page, limit, skip,} = getPagination(params.page, params.limit);

  const where: Prisma.LoanEmiScheduleWhereInput = {
    ...(params.loanId && { loanApplicationId: params.loanId }),
    ...(params.status && { status: params.status as any }),
    ...buildEmiSearch(params.q),
  };

  const [data, total] = await Promise.all([
    prisma.loanEmiSchedule.findMany({
      where,
      orderBy: { emiNo: "asc" },
      skip,
      take: limit,
      include: {
        loanApplication: {
          select: {
            id: true,
            loanNumber: true,
            approvedAmount: true,
            interestRate: true,
            tenureMonths: true,
            interestType: true,
            status: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contactNumber: true,
              },
            },
          },
        },
      },
    }),
    prisma.loanEmiSchedule.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
    },
  };
};


export const markEmiPaidService = async ({
  emiId,
  amountPaid,
  paymentMode,
  chequeStatus,
}: {
  emiId: string;
  amountPaid: number;
  paymentMode: "CASH" | "UPI" | "BANK" | "CHEQUE";
  chequeStatus?: "PENDING" | "CLEARED" | "BOUNCED";
}) => {
  const emi = await prisma.loanEmiSchedule.findUnique({
    where: { id: emiId },
  });

  if (!emi) throw new Error("Invalid EMI ID");

  const loan = await prisma.loanApplication.findUnique({
    where: { id: emi.loanApplicationId },
  });
  if (!loan) throw new Error("Associated loan application not found");

  if (loan.status !== "active" && loan.status == "defaulted") {
    throw new Error("Loan is not active or defaulted");
  }

  if (emi.status === "paid") {
    throw new Error("EMI already paid");
  }

  const paymentDate = new Date();

  /* ---------------- 1️⃣ Calculate Late Fee (READ ONLY) ---------------- */
  let lateFee = 0;
  if (paymentDate > emi.dueDate) {
    lateFee =
      emi.latePaymentFeeType === "FIXED"
        ? emi.latePaymentFee
        : (emi.emiAmount * emi.latePaymentFee) / 100;
  }

  /* ---------------- 2️⃣ Bounce Charge (ONLY ONCE) ---------------- */
  let bounceCharge = 0;
  const isChequeBounced =
    paymentMode === "CHEQUE" && chequeStatus === "BOUNCED";

  if (isChequeBounced && !emi.bounceChargeApplied) {
    bounceCharge = emi.bounceCharges;
  }

  /* ---------------- 3️⃣ Payable & Payment ---------------- */
  const alreadyPaid = emi.emiPaymentAmount ?? 0;

  const totalPayable = emi.emiAmount + lateFee + bounceCharge;

  // ✅ remaining amount for THIS EMI
  const remainingPayable = Math.max(totalPayable - alreadyPaid, 0);

  // ✅ do not allow overpayment
  const effectivePayment = Math.min(amountPaid, remainingPayable);

  const newPaidAmount = alreadyPaid + effectivePayment;

  const newStatus = newPaidAmount >= totalPayable ? "paid" : emi.status;
  /* ---------------- 4️⃣ DB Transaction ---------------- */
  return await prisma.$transaction(async (tx) => {
    // Payment history
    await tx.emiPayment.create({
      data: {
        emiScheduleId: emi.id,
        amount: effectivePayment,
        paymentDate,
        paymentMode,
        chequeStatus,
      },
    });
    // EMI update
    return tx.loanEmiSchedule.update({
      where: { id: emiId },
      data: {
        emiPaymentAmount: newPaidAmount,
        status: newStatus,
        paidDate: newStatus === "paid" ? paymentDate : null,

        // audit fields
        lastPaymentMode: paymentMode,
        chequeStatus,
        lastPaymentDate: paymentDate,

        // bounce protection
        bounceChargeApplied: emi.bounceChargeApplied || isChequeBounced,
      },
    });
  });
};

export const getEmisPayableAmountbyId = async (emiId: string) => {
  try {
    const emi = await prisma.loanEmiSchedule.findUnique({
      where: { id: emiId },
    });

    if (!emi) {
      throw new Error("EMI not found");
    }
    const today = new Date();

    /* ---------------- 1️⃣ Late Fee Logic ---------------- */
    let lateFee = 0;
    if (today > emi.dueDate) {
      if (emi.latePaymentFeeType === "FIXED") {
        lateFee = emi.latePaymentFee ?? 0;
      } else if (emi.latePaymentFeeType === "PERCENTAGE") {
        lateFee = (emi.emiAmount * (emi.latePaymentFee ?? 0)) / 100;
      }
    }

    /* ---------------- 2️⃣ Bounce Charge Logic ---------------- */
    let bounceCharge = 0;
    const isChequeBounced =
      emi.lastPaymentMode === "CHEQUE" && emi.chequeStatus === "BOUNCED";

    if (isChequeBounced && !emi.bounceChargeApplied) {
      bounceCharge = emi.bounceCharges;
    }

    /* ---------------- 3️⃣ Amount Calculation ---------------- */
    const alreadyPaid = emi.emiPaymentAmount ?? 0;
    const totalPayable = emi.emiAmount + lateFee + bounceCharge;
    const totalDue = totalPayable - alreadyPaid;

    return {
      emiId: emi.id,
      emiNo: emi.emiNo,
      dueDate: emi.dueDate,
      emiAmount: Number(emi.emiAmount.toFixed(2)),
      lateFee: Number(lateFee.toFixed(2)),
      bounceCharge: Number(bounceCharge.toFixed(2)),
      alreadyPaid: Number(alreadyPaid.toFixed(2)),
      totalPayable: Number(Math.max(totalDue, 0).toFixed(2)),
      isOverdue: today > emi.dueDate,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch payable EMI amount");
  }
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
          ? (emi.latePaymentFee ?? 0)
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
    }),
  );

  return overdueEmis.length;
};

export const getPayableEmiAmountService = async (emiId: string) => {
  const emi = await prisma.loanEmiSchedule.findUnique({
    where: { id: emiId },
  });

  if (!emi) {
    throw new Error("EMI not found");
  }

  const today = new Date();

  /* ---------------- 1️⃣ Late Fee Logic ---------------- */
  let lateFee = 0;

  if (today > emi.dueDate) {
    if (emi.latePaymentFeeType === "FIXED") {
      lateFee = emi.latePaymentFee ?? 0;
    } else if (emi.latePaymentFeeType === "PERCENTAGE") {
      lateFee = (emi.emiAmount * (emi.latePaymentFee ?? 0)) / 100;
    }
  }

  /* ---------------- 2️⃣ Bounce Charge Logic ---------------- */
  let bounceCharge = 0;

  /* ---------------- 3️⃣ Amount Calculation ---------------- */
  const alreadyPaid = emi.emiPaymentAmount ?? 0;

  const totalPayable = emi.emiAmount + lateFee + bounceCharge - alreadyPaid;

  /* ---------------- 4️⃣ Response ---------------- */
  return {
    emiId: emi.id,
    emiNo: emi.emiNo,
    dueDate: emi.dueDate,
    emiAmount: Number(emi.emiAmount.toFixed(2)),
    lateFee: Number(lateFee.toFixed(2)),
    bounceCharge: Number(bounceCharge.toFixed(2)),
    alreadyPaid: Number(alreadyPaid.toFixed(2)),
    totalPayable: Number(Math.max(totalPayable, 0).toFixed(2)),
    isOverdue: today > emi.dueDate,
  };
};

export const payEmiService = async (
  emiId: string,
  amount: number,
  paymentMode: string,
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const emi = await tx.loanEmiSchedule.findUnique({
        where: { id: emiId },
      });
      if (!emi) {
        throw new Error("EMI not found");
      }

      const loan = await tx.loanApplication.findUnique({
        where: { id: emi.loanApplicationId },
      });

      if (loan?.status !== "active" && loan?.status !== "defaulted") {
        throw new Error("Loan is not active");
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
      0,
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
  loanApplicationId: string,
) => {
  /* 1️⃣ Current month range */
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);

  /* 2️⃣ Fetch ALL pending & overdue EMIs till this month */
  const emis = await prisma.loanEmiSchedule.findMany({
    where: {
      loanApplicationId,
      status: { in: ["pending", "overdue"] },
      dueDate: { lte: endOfMonth },
    },
    orderBy: { dueDate: "asc" },
  });

  if (emis.length === 0) {
    throw new Error("No EMI due till this month");
  }

  const today = new Date();

  let totalEmiAmount = 0;
  let totalLateFee = 0;
  let totalBounceCharge = 0;
  let totalAlreadyPaid = 0;

  /* 3️⃣ Calculate EMI-wise charges */
  const emiBreakup = emis.map((emi) => {
    const isOverdue = today > emi.dueDate;

    /* ---- Late Fee ---- */
    let lateFee = 0;
    if (isOverdue) {
      lateFee =
        emi.latePaymentFeeType === "FIXED"
          ? (emi.latePaymentFee ?? 0)
          : (emi.emiAmount * (emi.latePaymentFee ?? 0)) / 100;
    }

    /* ---- Bounce Charge (ONLY IF BOUNCED) ---- */
    let bounceCharge = 0;
    if (
      emi.bounceChargeApplied &&
      emi.lastPaymentMode === "CHEQUE" &&
      emi.chequeStatus === "BOUNCED"
    ) {
      bounceCharge = emi.bounceCharges ?? 0;
    }

    const alreadyPaid = emi.emiPaymentAmount ?? 0;

    totalEmiAmount += emi.emiAmount;
    totalLateFee += lateFee;
    totalBounceCharge += bounceCharge;
    totalAlreadyPaid += alreadyPaid;

    return {
      emiId: emi.id,
      emiNo: emi.emiNo,
      dueDate: emi.dueDate,
      emiAmount: Number(emi.emiAmount.toFixed(2)),
      lateFee: Number(lateFee.toFixed(2)),
      bounceCharge: Number(bounceCharge.toFixed(2)),
      alreadyPaid: Number(alreadyPaid.toFixed(2)),
      totalPayable: Number(
        Math.max(
          emi.emiAmount + lateFee + bounceCharge - alreadyPaid,
          0,
        ).toFixed(2),
      ),
      status: emi.status,
      isOverdue,
    };
  });

  /* 4️⃣ Grand total */
  const grandTotal =
    totalEmiAmount + totalLateFee + totalBounceCharge - totalAlreadyPaid;

  return {
    loanApplicationId,
    totalEmisDue: emis.length,
    breakdown: emiBreakup,
    summary: {
      totalEmiAmount: Number(totalEmiAmount.toFixed(2)),
      totalLateFee: Number(totalLateFee.toFixed(2)),
      totalBounceCharge: Number(totalBounceCharge.toFixed(2)),
      totalAlreadyPaid: Number(totalAlreadyPaid.toFixed(2)),
      totalPayable: Number(Math.max(grandTotal, 0).toFixed(2)),
    },
  };
};

export const payforecloseLoanService = async (
  loanApplicationId: string,
  data: any,
) => {
  try {
    const loan = await prisma.loanApplication.findUnique({
      where: { id: loanApplicationId },
    });
    if (!loan) {
      throw new Error("Loan application not found");
    }

    if (loan.status !== "active" && loan.status !== "defaulted") {
      throw new Error("Loan is not active");
    }

    //count PAID EMIs
    const paidEmisCount = await prisma.loanEmiSchedule.count({
      where: {
        loanApplicationId: loanApplicationId,
        status: "paid",
      },
    });

    // minimum 6 emis should be paid before foreclosing
    if (paidEmisCount < 6) {
      throw new Error(
        "At least 6 EMIs must be paid before foreclosing the loan",
      );
    }

    const emis = await prisma.loanEmiSchedule.findMany({
      where: {
        loanApplicationId: loanApplicationId,
        status: { in: ["pending", "overdue"] },
      },
    });
    const outstandingPrincipal = emis.reduce(
      (sum, e) => sum + e.principalAmount,
      0,
    );
    const foreclosureCharge =
      outstandingPrincipal * ((loan.foreclosureCharges ?? 0) / 100);

    const totalPayable = outstandingPrincipal + foreclosureCharge;
    const totalPayableFormatted = totalPayable.toFixed(2);

    if (data.amountPaid <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }
    if (data.amountPaid < totalPayable) {
      throw new Error("Insufficient amount to foreclose the loan");
    }

    if (data.amountPaid >= totalPayable) {
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

  if (loan.status !== "active") {
    throw new Error("Moratorium can be applied only on active loans");
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
      "An active moratorium already exists for this loan in the specified period",
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

export const editEmiService = async (emiId: string, newDueDate: Date) => {
  const emi = await prisma.loanEmiSchedule.findUnique({
    where: { id: emiId },
  });

  if (!emi) {
    throw new Error("EMI not found");
  }

  return prisma.loanEmiSchedule.update({
    where: { id: emiId },
    data: {
      dueDate: newDueDate, // ✅ only Date
    },
  });
};
