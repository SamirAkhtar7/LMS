import { prisma } from "../../db/prismaService.js";
import { CreateLoanApplication } from "./loanApplication.types.js";
import createLoanApplicationSchema from "./loanApplication.schema.js";
import type { Prisma } from "../../../generated/prisma-client/client.js";
import type * as Enums from "../../../generated/prisma-client/enums.js";

export async function createLoanApplicationService(
  data: CreateLoanApplication,
  loggedInUser: { id: string; role: Enums.Role }
) {
  if (!["EMPLOYEE", "ADMIN"].includes(loggedInUser.role)) {
    throw new Error("Not authorized to create loan application");
  }

  const parsed = createLoanApplicationSchema.parse(data as any);

  const dob =
    parsed.dob && typeof parsed.dob === "string"
      ? new Date(parsed.dob)
      : parsed.dob;

  return prisma.$transaction(async (tx) => {
    // 1. Find or create customer
    let customer = await tx.customer.findFirst({
      where: {
        OR: [
          parsed.panNumber ? { panNumber: parsed.panNumber } : undefined,
          parsed.aadhaarNumber
            ? { aadhaarNumber: parsed.aadhaarNumber }
            : undefined,
          parsed.contactNumber
            ? { contactNumber: parsed.contactNumber }
            : undefined,
        ].filter(Boolean) as object[],
      },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          title: parsed.title as Enums.Title,
          firstName: parsed.firstName,
          lastName: parsed.lastName ?? "",
          middleName: parsed.middleName ?? undefined,
          gender: parsed.gender as Enums.Gender,
          dob: dob as Date,
          aadhaarNumber: parsed.aadhaarNumber ?? undefined,
          panNumber: parsed.panNumber ?? undefined,
          contactNumber: parsed.contactNumber,
          alternateNumber: parsed.alternateNumber ?? undefined,
          employmentType: parsed.employmentType as Enums.EmploymentType,
          monthlyIncome: parsed.monthlyIncome ?? undefined,
          annualIncome: parsed.annualIncome ?? undefined,
          email: parsed.email ?? undefined,
          address: parsed.address ?? "",
          city: parsed.city ?? "",
          state: parsed.state ?? "",
          pinCode: parsed.pinCode ?? "",
          status: "ACTIVE",
        },
      });
    }

    // 2. Prevent duplicate active loans
    const existingLoan = await tx.loanApplication.findFirst({
      where: {
        customerId: customer.id,
        status: {
          in: [
            "application_in_progress",
            "kyc_pending",
            "under_review",
            "approved",
            "active",
          ],
        },
      },
    });

    if (existingLoan) {
      const err: any = new Error(
        "Customer already has an active loan application"
      );
      err.statusCode = 409;
      throw err;
    }

    // 3. Create loan application
    const loanApplication = await tx.loanApplication.create({
      data: {
        requestedAmount: parsed.requestedAmount,
        tenureMonths: parsed.tenureMonths,
        interestRate: parsed.interestRate,
        interestType: parsed.interestType ?? "flat",
        loanPurpose: parsed.loanPurpose,
        cibilScore: parsed.cibilScore,
        status: "kyc_pending",
        createdById: loggedInUser.id,
        customerId: customer.id,
      },
    });

    // 4. Create KYC record (auto-init)
    const kyc = await tx.kyc.create({
      data: {
        loanApplication: { connect: { id: loanApplication.id } },
        userId: customer.id,
        status: "PENDING",
      },
    });

    // 5. Link KYC to loan
    await tx.loanApplication.update({
      where: { id: loanApplication.id },
      data: { kycId: kyc.id },
    });

    return {
      loanApplication,
      customer,
      kyc,
    };
  });
}

export const getAllLoanApplicationsService = async () => {
  // Implementation for retrieving all loan applications
  try {
    const loanApplications = await prisma.loanApplication.findMany({
      include: {
        customer: true,
        kyc: {
          include: {
            documents: true,
          },
        },
        documents: true,
      },
    });
    return loanApplications;
  } catch (error) {
    throw error;
  }
};
export const getLoanApplicationByIdService = async (id: string) => {
  // Implementation for retrieving a loan application by ID
  try {
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        customer: true,
        kyc: {
          include: {
            documents: true,
          },
        },
        documents: true,
      },
    });
    return loanApplication;
  } catch (error) {
    throw error;
  }
};
export const updateLoanApplicationStatusService = async (
  id: string,
  statusData: any
) => {
  // Implementation for updating loan application status
  try {
    const updatedLoanApplication = await prisma.loanApplication.update({
      where: { id },
      data: { status: statusData.status },
      include: {
        customer: true,
        kyc: {
          include: {
            documents: true,
          },
        },
        documents: true,
      },
    });
    return updatedLoanApplication;
  } catch (error) {
    throw error;
  }
  return {}; // return updated loan application data
};

export const reviewLoanService = async (loanId: string) => {
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanId },
    include: {
      customer: true,
      lead: true,
      kyc: {
        include: {
          documents: true,
        },
      },
    },
  });
  if (!loan) throw new Error("Loan not found");

  if (loan.status !== "application_in_progress") {
    throw new Error("Loan not eligible for review");
  }
  return prisma.loanApplication.update({
    where: { id: loanId },
    data: { status: "under_review" },
  });
};

export const approveLoanService = async (loanId: string, userId: string) => {
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanId },
  });

  if (!loan || loan.status !== "under_review") {
    throw new Error("Loan not ready for approval");
  }

  return prisma.loanApplication.update({
    where: { id: loanId },
    data: {
      status: "approved",
      approvalDate: new Date(),
      approvedBy: userId,
    },
  });
};

export const rejectLoanService = async (
  loanId: string,
  reason: string,
  userId: string
) => {
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanId },
  });

  if (!loan || loan.status !== "under_review") {
    throw new Error("Loan not ready for rejection");
  }

  return prisma.loanApplication.update({
    where: { id: loanId },
    data: {
      status: "rejected",
      rejectionReason: reason,
      approvedBy: userId,
    },
  });
};
