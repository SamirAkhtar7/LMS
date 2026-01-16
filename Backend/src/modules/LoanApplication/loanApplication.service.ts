import { prisma } from "../../db/prismaService.js";
import {
  apperoveLoanInput,
  CreateLoanApplication,
} from "./loanApplication.types.js";
import createLoanApplicationSchema from "./loanApplication.schema.js";
import type { Prisma } from "../../../generated/prisma-client/client.js";
import type * as Enums from "../../../generated/prisma-client/enums.js";
import { fi } from "zod/locales";

export async function createLoanApplicationService(
  data: CreateLoanApplication,
  loggedInUser: { id: string; role: Enums.Role }
) {
  if (!["EMPLOYEE", "ADMIN"].includes(loggedInUser.role)) {
    throw new Error("Not authorized to create loan application");
  }

  const parsed = createLoanApplicationSchema.parse(data);

  const loanType = await prisma.loanType.findUnique({
    where: {
      id: parsed.loanTypeId,
      isActive: true,
      //deletedAt: null,
    },
  });
  if (!loanType) {
    throw new Error("Invalid loan type");
  }
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
          voterId: parsed.voterId ?? undefined,
          maritalStatus: parsed.maritalStatus as Enums.MaritalStatus,
          nationality: parsed.nationality,
          category: parsed.category as Enums.Category,
          spouseName: parsed.spouseName,
          passportNumber: parsed.passportNumber,
          contactNumber: parsed.contactNumber,
          alternateNumber: parsed.alternateNumber ?? undefined,
          employmentType: parsed.employmentType as Enums.EmploymentType,
          monthlyIncome: parsed.monthlyIncome ?? undefined,
          annualIncome: parsed.annualIncome ?? undefined,

          bankName: parsed.bankName,
          bankAccountNumber: parsed.bankAccountNumber,
          ifscCode: parsed.ifscCode,
          accountType: parsed.accountType,
          otherIncome: parsed.otherIncome,

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
        loanTypeId: parsed.loanTypeId,
        requestedAmount: parsed.requestedAmount,
        tenureMonths: parsed.tenureMonths,
        interestRate: parsed.interestRate,
        emiAmount: parsed.emiAmount,
        purposeDetails: parsed.purposeDetails,

        coApplicantName: parsed.coApplicantName,
        coApplicantContact: parsed.coApplicantContact,
        coApplicantIncome: parsed.coApplicantIncome,
        coApplicantRelation:
          parsed.coApplicantRelation as Enums.CoApplicantRelation,
        coApplicantPan: parsed.coApplicantPan,
        coApplicantAadhaar: parsed.coApplicantAadhaar,

        interestType: parsed.interestType ?? "FLAT",
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
        // `Kyc.userId` references `User`, not `Customer` — use the creating
        // user's id to satisfy the foreign key. To link KYC to the customer,
        // the `loanApplication` relation is used above.
        userId: loggedInUser.id,
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

export async function uploadLoanDocumentsService(
  loanApplicationId: string,
  documents: {
    documentType: string;
    documentPath: string;
    uploadedBy: string;
  }[],
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const loanApplication = await tx.loanApplication.findUnique({
      where: { id: loanApplicationId },
      include: {
        kyc: true,
        loanType: true,
      },
    });

    if (!loanApplication) {
      throw new Error("Loan application not found");
    }
    if (!loanApplication.kyc) {
      throw new Error("KYC record not found for loan application");
    }

    const createdDocuments = await Promise.all(
      documents.map((doc) =>
        tx.document.create({
          data: {
            loanApplicationId: loanApplication.id,
            kycId: loanApplication.kyc!.id,
            documentType: doc.documentType,
            documentPath: doc.documentPath,
            uploadedBy: doc.uploadedBy,
          },
        })
      )
    );

    return createdDocuments;
  });
}

export async function verifyDocumentService(
  documentId: string,
  verifierId: string
) {
  return prisma.$transaction(async (tx) => {
    const document = await tx.document.update({
      where: { id: documentId },
      data: {
        verified: true,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        verificationStatus: "verified",
      },
    });
    const unverifiedCount = await tx.document.count({
      where: {
        kycId: document.kycId,
        verificationStatus: "pending",
      },
    });

    if (unverifiedCount === 0) {
      if (!document.kycId) throw new Error("Document missing kycId");
      if (!document.loanApplicationId)
        throw new Error("Document missing loanApplicationId");

      await tx.kyc.update({
        where: { id: document.kycId },
        data: {
          status: "VERIFIED",
          verifiedBy: verifierId,
          verifiedAt: new Date(),
        },
      });
      await tx.loanApplication.update({
        where: { id: document.loanApplicationId },
        data: {
          status: "under_review",
        },
      });
    }

    return document;
  });
}

export async function rejectDocumentService(
  documentId: string,
  reason: string,
  verifierId: string
) {
  const existing = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!existing) {
    const err: any = new Error("Document not found");
    err.statusCode = 404;
    throw err;
  }
  if (!existing.loanApplicationId) {
    const err: any = new Error("Document not linked to any loan application");
    err.statusCode = 400;
    throw err;
  }
  const loanApplication = await prisma.loanApplication.findUnique({
    where: { id: existing.loanApplicationId },
  });

  if (!loanApplication) {
    const err: any = new Error("Associated loan application not found");
    err.statusCode = 404;
    throw err;
  }
  if (loanApplication.status !== "kyc_pending") {
    const err: any = new Error("Loan application not in KYC pending status");
    err.statusCode = 400;
    throw err;
  }

  const document = await prisma.document.update({
    where: { id: documentId },
    data: {
      verified: false,
      verifiedBy: verifierId,
      verifiedAt: new Date(),
      verificationStatus: "rejected",
      rejectionReason: reason,
    },
  });

  if (!document.kycId) throw new Error("Document missing kycId");
  if (!document.loanApplicationId)
    throw new Error("Document missing loanApplicationId");
  await prisma.kyc.update({
    where: { id: document.kycId },
    data: {
      status: "REJECTED",
      verifiedBy: verifierId,
      verifiedAt: new Date(),
    },
  });
  await prisma.loanApplication.update({
    where: { id: document.loanApplicationId },
    data: {
      status: "kyc_pending",
    },
  });
  return document;
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
        loanType: true,
        kyc: {
          include: {
            documents: true,
          },
        },
      },
    });
    return loanApplication;
  } catch (error) {
    throw error;
  }
};

type StatusUpdate = {
  status: Enums.LoanStatus;
};
export const updateLoanApplicationStatusService = async (
  id: string,
  statusData: StatusUpdate
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

export const approveLoanService = async (
  loanId: string,
  userId: string,
  data: apperoveLoanInput
) => {
  // normalize emiStartDate to a full ISO Date if provided as yyyy-mm-dd string
  let emiStartDateNormalized: Date | undefined = undefined;
  if (data.emiStartDate !== undefined && data.emiStartDate !== null) {
    if (typeof data.emiStartDate === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(data.emiStartDate)) {
        emiStartDateNormalized = new Date(data.emiStartDate + "T00:00:00.000Z");
      } else {
        const parsed = new Date(data.emiStartDate);
        if (isNaN(parsed.getTime())) throw new Error("Invalid emiStartDate");
        emiStartDateNormalized = parsed;
      }
    } else {
      emiStartDateNormalized = new Date(data.emiStartDate as any);
    }
  }

  const result = await prisma.loanApplication.updateMany({
    where: {
      id: loanId,
      status: "under_review",
    },
    data: {
      status: "approved",
      latePaymentFeeType: data.latePaymentFeeType,
      latePaymentFee: data.latePaymentFee,
      bounceCharges: data.bounceCharges,

      approvedAmount: data.approvedAmount,
      tenureMonths: data.tenureMonths,

      interestType: data.interestType,
      interestRate: data.interestRate,

      foreclosureAllowed: data.foreclosureAllowed ?? true,
      foreclosureChargesType: data.foreclosureChargesType,
      foreclosureCharges: data.foreclosureCharges,

      prepaymentAllowed: data.prepaymentAllowed ?? true,
      prepaymentChargeType: data.prepaymentChargeType,
      prepaymentCharges: data.prepaymentCharges,

      emiStartDate: emiStartDateNormalized,
      emiPaymentAmount: data.emiPaymentAmount,
      emiAmount: data.emiAmount,



      approvalDate: new Date(),
      approvedBy: userId,
      approvedAt: new Date(),
    },
  });

  // console.log("APPROVE DATA", {
  //   latePaymentFeeType: data.latePaymentFeeType,
  //   latePaymentFee: data.latePaymentFee,
  //   bounceCharges: data.bounceCharges,
  // });

  if (result.count === 0) {
    throw new Error("Loan not ready for approval");
  }

  return prisma.loanApplication.findUnique({ where: { id: loanId } });
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
