import { prisma } from "../../db/prismaService.js";
import { LoanTypeDTO } from "./loanTypes.types.js";
import { z } from "zod";
import { createLoanTypeSchema } from "./loanTypes.schema.js";

//type CreateLoanTypeInput = z.infer<typeof createLoanTypeSchema>;
export const createLoanTypeService = async (loanTypeData: LoanTypeDTO) => {
  try {
    const data = createLoanTypeSchema.parse(loanTypeData);

    const existingLoanType = await prisma.loanType.findUnique({
      where: { code: data.code },
      select: { id: true },
    });

    if (existingLoanType) {
      throw new Error(`LoanType with code "${data.code}" already exists`);
    }

    if (data.minAmount > data.maxAmount) {
      throw new Error(`Minimum amount cannot be greater than maximum amount`);
    }

    if (data.minTenureMonths > data.maxTenureMonths) {
      throw new Error("minTenureMonths cannot be greater than maxTenureMonths");
    }

    if (data.minInterestRate > data.maxInterestRate) {
      throw new Error("minInterestRate cannot be greater than maxInterestRate");
    }

    if (
      data.defaultInterestRate < data.minInterestRate ||
      data.defaultInterestRate > data.maxInterestRate
    ) {
      throw new Error(
        "defaultInterestRate must be within min & max interest rate"
      );
    }

    if (data.minAge > data.maxAge) {
      throw new Error("minAge cannot be greater than maxAge");
    }

    if (
      data.minCibilScore &&
      data.maxCibilScore &&
      data.minCibilScore > data.maxCibilScore
    ) {
      throw new Error("minCibilScore cannot be greater than maxCibilScore");
    }

    if (data.gstApplicable && !data.gstPercentage) {
      throw new Error("gstPercentage is required when gstApplicable is true");
    }

    const loanType = await prisma.loanType.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,

        category: data.category,
        secured: data.secured,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        minTenureMonths: data.minTenureMonths,
        maxTenureMonths: data.maxTenureMonths,

        interestType: data.interestType,
        minInterestRate: data.minInterestRate,
        maxInterestRate: data.maxInterestRate,
        defaultInterestRate: data.defaultInterestRate,

        processingFeeType: data.processingFeeType,
        processingFee: data.processingFee,
        gstApplicable: data.gstApplicable,
        gstPercentage: data.gstApplicable ? data.gstPercentage : null,

        minAge: data.minAge,
        maxAge: data.maxAge,
        minIncome: data.minIncome,
        employmentType: data.employmentType,

        minCibilScore: data.minCibilScore,
        maxCibilScore: data.maxCibilScore,
        maxLoanToValueRatio: data.maxLoanToValueRatio,
        prepaymentAllowed: data.prepaymentAllowed,
        foreclosureAllowed: data.foreclosureAllowed,
        foreclosureCharges: data.foreclosureAllowed
          ? data.foreclosureCharges
          : null,
        prepaymentCharges: data.prepaymentAllowed
          ? data.prepaymentCharges
          : null,

        isActive: data.isActive,
        isPublic: data.isPublic,

        estimatedProcessingTimeDays: data.estimatedProcessingTimeDays,
        documentsRequired: data.documentsRequired,
      },
    });

    return loanType;

  } catch (error) {
      
    throw new Error("Error creating loan type");
  }
  // Simulate database save with a delay
  return new Promise<LoanTypeDTO>((resolve) => {
    setTimeout(() => {
      resolve(loanTypeData);
    }, 100);
  });
};

// export const softDeleteLoanTypeService = async (
//   loanTypeId: string,
//   deletedByUserId: string
// ) => {
//   const loanType = await prisma.loanType.findFirst({
//     where: {
//       id: loanTypeId,
//       deletedAt: null,
//     },
//   });

//   if (!loanType) {
//     throw new Error("LoanType not found or already deleted");
//   }

//   return prisma.loanType.update({
//     where: { id: loanTypeId },
//     data: {
//       deletedAt: new Date(),
//       deletedBy: deletedByUserId,
//       isActive: false,
//     },
//   });
// };
