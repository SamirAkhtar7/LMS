import { prisma } from "../../db/prismaService.js";
import {
  apperoveLoanInput,
  CreateLoanApplication,
} from "./loanApplication.types.js";
import createLoanApplicationSchema, {
  ApperoveLoanInput,
} from "./loanApplication.schema.js";
import * as Enums from "../../../generated/prisma-client/enums.js";
import { generateLoanNumber } from "../../common/generateId/generateLoanNumber.js";
import {
  getPagination,
  buildPaginationMeta,
} from "../../common/utils/pagination.js";
import { buildLoanApplicationSearch } from "../../common/utils/search.js";

import path from "path";
import fs from "fs";
import { getAccessibleBranchIds } from "../../common/utils/branchAccess.js";

interface CoApplicantDocumentUpload {
  coApplicants: { id: string; documentType: string }[];
  files: Express.Multer.File[];
  uploadedBy: string;
}

export async function createLoanApplicationService(
  data: CreateLoanApplication,
  loggedInUser: { id: string; role: Enums.Role },
) {
  try {
    const parsed = createLoanApplicationSchema.parse(data);
    const loanType = await prisma.loanType.findFirst({
      where: { id: parsed.loanTypeId },
    });
    if (!loanType || !loanType.isActive) {
      throw new Error("Invalid loan type");
    }
    const dobValue =
      parsed.dob && typeof parsed.dob === "string"
        ? new Date(parsed.dob)
        : parsed.dob;
    
    /* -------- Get branchId from user's employee record -------- */
    const employee = await prisma.employee.findUnique({
      where: { userId: loggedInUser.id },
      select: { branchId: true },
    });
    
    if (!employee?.branchId) {
      throw new Error("Employee branch information not found");
    }
    
    return prisma.$transaction(async (tx) => {
      /* -------- 1. Find or create customer -------- */
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
            title: parsed.title,
            firstName: parsed.firstName,
            lastName: parsed.lastName ?? "",
            middleName: parsed.middleName,
            gender: parsed.gender as Enums.Gender,
            dob: dobValue,
            aadhaarNumber: parsed.aadhaarNumber,
            panNumber: parsed.panNumber,
            voterId: parsed.voterId,
            maritalStatus: parsed.maritalStatus,
            nationality: parsed.nationality,
            category: parsed.category,
            contactNumber: parsed.contactNumber,
            alternateNumber: parsed.alternateNumber,
            employmentType: parsed.employmentType,
            monthlyIncome: parsed.monthlyIncome,
            annualIncome: parsed.annualIncome,
            bankName: parsed.bankName,
            bankAccountNumber: parsed.bankAccountNumber,
            ifscCode: parsed.ifscCode,
            accountType: parsed.accountType,
            email: parsed.email,
            address: parsed.address,
            city: parsed.city,
            state: parsed.state,
            pinCode: parsed.pinCode,
            status: "ACTIVE",
          },
        });
      } /* -------- 2. Prevent duplicate active loan -------- */
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
          "Customer already has an active loan application",
        );
        err.statusCode = 409;
        throw err;
      } /* -------- 3. Generate Loan Number -------- */
      const loanNumber = await generateLoanNumber(tx);
      /* -------- 4. Create Loan Application -------- */
      const loanApplication = await tx.loanApplication.create({
        data: {
          loanNumber,
          customerId: customer.id,
          loanTypeId: parsed.loanTypeId,
          requestedAmount: parsed.requestedAmount,
          tenureMonths: parsed.tenureMonths,
          interestRate: parsed.interestRate,
          emiAmount: parsed.emiAmount,
          interestType: parsed.interestType ?? "FLAT",
          purposeDetails: parsed.purposeDetails,
          loanPurpose: parsed.loanPurpose,
          cibilScore: parsed.cibilScore,
          status: "kyc_pending",
          createdById: loggedInUser.id,
          branchId: employee.branchId,
        },
      });
      /* -------- 5. Create PRIMARY KYC -------- */
      const primaryKyc = await tx.kyc.create({
        data: {
          userId: loggedInUser.id,
          status: Enums.KycStatus.PENDING,
          loanApplication: { connect: { id: loanApplication.id } },
        },
      });
      /* -------- 6. Link KYC -------- */
      await tx.loanApplication.update({
        where: { id: loanApplication.id },
        data: { kycId: primaryKyc.id },
      });

      /* -------- 7. primary Documents  -------- */

      if (parsed.coApplicants?.length) {
        for (const co of parsed.coApplicants) {
          const coApplication = await tx.coApplicant.create({
            data: {
              loanApplicationId: loanApplication.id,
              firstName: co.firstName,
              LastName: co.lastName ?? "",
              relation: co.relation as Enums.CoApplicantRelation,
              contactNumber: co.contactNumber,
              email: co.email,
              dob: co.dob,
              aadhaarNumber: co.aadhaarNumber,
              panNumber: co.panNumber,
              employmentType: co.employmentType as Enums.EmploymentType,
              monthlyIncome: co.monthlyIncome,
            },
          });

          const coKyc = await tx.kyc.create({
            data: {
              userId: loggedInUser.id,
              status: Enums.KycStatus.PENDING,
            },
          });

          await tx.coApplicant.update({
            where: { id: coApplication.id },
            data: { kycId: coKyc.id },
          });
        }
      }
      return {
        loanApplication,
        customer,
        primaryKyc,
        coApplicantsCreated: parsed.coApplicants?.length ?? 0,
      };
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      const err: any = new Error("Loan number collision, retry request");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

export async function uploadLoanDocumentsService(
  loanApplicationId: string,
  documents: {
    documentType: string;
    documentPath: string;
    uploadedBy: string;
  }[],
) {
  return prisma.$transaction(async (tx) => {
    /* 1️⃣ Validate loan & KYC */
    const loanApplication = await tx.loanApplication.findUnique({
      where: { id: loanApplicationId },
      select: {
        id: true,
        kyc: { select: { id: true } },
      },
    });

    if (!loanApplication) {
      throw new Error("Loan application not found");
    }

    if (!loanApplication.kyc) {
      throw new Error("KYC record not found for loan application");
    }
    /*   check already uploaded document types */
    const existingDocs = await tx.document.findMany({
      where: { loanApplicationId },
      select: { documentType: true },
    });
    const existingTypes = new Set(existingDocs.map((d) => d.documentType));

    const duplicateDocs = documents
      .map((d) => d.documentType)
      .filter((type) => existingTypes.has(type));

    if (duplicateDocs.length > 0) {
      const err: any = new Error(
        `Document(s) already uploaded: ${duplicateDocs.join(", ")}`,
      );
      err.statusCode = 409;
      err.duplicateDocs = duplicateDocs;
      throw err;
    }

    /* 2️⃣ Bulk insert documents (safe) */
    await tx.document.createMany({
      data: documents.map((doc) => ({
        loanApplicationId,
        kycId: loanApplication.kyc!.id,
        documentType: doc.documentType,
        documentPath: doc.documentPath,
        uploadedBy: doc.uploadedBy,
      })),
      skipDuplicates: true, // 🔒 protects against race conditions
    });

    /* 3️⃣ Return uploaded documents */
    return tx.document.findMany({
      where: { loanApplicationId },
      orderBy: { createdAt: "asc" },
    });
  });
}

export async function verifyDocumentService(
  documentId: string,
  verifierId: string,
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
          status: Enums.KycStatus.VERIFIED,
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
  verifierId: string,
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
      status: Enums.KycStatus.REJECTED,
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

export const reuploadLoanDocumentService = async (
  loanApplicationId: string,
  documentType: string,
  file: {
    filename: string;
    path: string;
    uploadedBy: string;
  },
) => {
  return prisma.$transaction(async (tx) => {
    /* 1️⃣ Find existing document */
    const existingDoc = await tx.document.findFirst({
      where: {
        loanApplicationId,
        documentType,
      },
    });

    if (!existingDoc) {
      const err: any = new Error(
        `Document ${documentType} not found. Upload first.`,
      );
      err.statusCode = 404;
      throw err;
    }
    /* 2️⃣ Delete old file from disk */
    if (existingDoc.documentPath) {
      const oldFilePath = path.join(
        process.cwd(),
        "public",
        existingDoc.documentPath,
      );

      try {
        fs.unlinkSync(oldFilePath);
      } catch (err: any) {
        if (err.code !== "ENOENT") {
          // Log unexpected errors but don't fail the transaction
          console.error(`Failed to delete old file: ${oldFilePath}`, err);
        }
      }
    }
    /* 3️⃣ Update document */
    return tx.document.update({
      where: { id: existingDoc.id },
      data: {
        documentPath: `/uploads/${file.filename}`,
        uploadedBy: file.uploadedBy,
        verificationStatus: "pending",
        rejectionReason: null,
        verified: false,
        verifiedBy: null,
        verifiedAt: null,
      },
    });
  });
};

export const getAllLoanApplicationsService = async (params: {
  page?: number;
  limit?: number;
  q?: string;
  user: { id: string; role: Enums.Role };
}) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);

  let userBranchId: string | undefined;
  if (params.user.role === "EMPLOYEE") {
    const employee = await prisma.employee.findUnique({
      where: { userId: params.user.id },
      select: { branchId: true }
    })
    if (!employee) {
      throw new Error("Employee record not found for user");
    }
    userBranchId = employee.branchId;
  }
  const accessibleBranches = await getAccessibleBranchIds({
    id: params.user.id,
    role: params.user.role,
    branchId: userBranchId,
  });
  const searchFilter = buildLoanApplicationSearch(params.q);

  const where: any = {
    ...searchFilter,
    ...(accessibleBranches ? { branchId: { in: accessibleBranches } } : {}),
  };

  const employee = await prisma.employee.findUnique({
    where: { userId: params.user.id },
 
  });

  if (params.user.role === "EMPLOYEE") {
    where.loanAssignments = {
      some: {
        employeeId: employee?.id,
        isActive: true,
      },
    };
  }

  const [data, total] = await Promise.all([
    prisma.loanApplication.findMany({
      where,
      include: {
        customer: true,
        kyc: { include: { documents: true } },
        coapplicants: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.loanApplication.count({ where }),
  ]);


  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
};

export const getLoanApplicationByIdService = async (id: string) => {
  // Implementation for retrieving a loan application by ID
  try {
    const loanApplication = await prisma.loanApplication.findUnique({
      where: { id },
      include: {
        customer: true,
        loanType: true,
        emis: true,
        kyc: {
          include: {
            documents: true,
          },
        },
        loanRecoveries: {
          include: {
            recoveryPayments: true,
          },
        },
        coapplicants: {
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
  statusData: StatusUpdate,
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
  data: ApperoveLoanInput,
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

  if (result.count === 0) {
    throw new Error("Loan not ready for approval");
  }

  return prisma.loanApplication.findUnique({ where: { id: loanId } });
};

export const rejectLoanService = async (
  loanId: string,
  reason: string,
  userId: string,
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
