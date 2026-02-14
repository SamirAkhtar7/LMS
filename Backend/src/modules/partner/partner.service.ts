import { prisma } from "../../db/prismaService.js";
import { hashPassword } from "../../common/utils/utils.js";
import { CreatePartner } from "./partner.types.js";
import { generateUniquePartnerNumber } from "../../common/generateId/generatePartnerId.js";
import { getPagination } from "../../common/utils/pagination.js";
import { buildPartnerSearch } from "../../common/utils/search.js";
import { createLeadSchema } from "../lead/lead.schema.js";
import { z } from "zod";
import { generateLoanNumber } from "../../common/generateId/generateLoanNumber.js";
import { CreateLoanApplication } from "../LoanApplication/loanApplication.types.js";
import * as Enums from "../../../generated/prisma-client/enums.js";
import { logAction } from "../../audit/audit.helper.js";
import { generateUniqueLeadNumber } from "../../common/generateId/generateLeadNumber.js";
import createLoanApplicationSchema from "../LoanApplication/loanApplication.schema.js";

export async function createPartnerService(partnerData: CreatePartner) {
  const existing = await prisma.user.findUnique({
    where: { email: partnerData.email },
  });
  if (existing) {
    throw new Error("User with this email already exists");
  }
  try {
    if (!partnerData.branchId) {
      throw new Error("Branch assignment is required for partner");
    }

    const branch = await prisma.branch.findUnique({
      where: { id: partnerData.branchId },
    });

    if (!branch || !branch.isActive) {
      throw new Error("Invalid or inactive branch");
    }

    const hashedPassword = await hashPassword(partnerData.password);
    const user = await prisma.user.create({
      data: {
        fullName: partnerData.fullName,
        userName: partnerData.userName,
        email: partnerData.email,
        password: hashedPassword,
        role: "PARTNER",
        contactNumber: partnerData.contactNumber ?? "",
        branchId: partnerData.branchId,
        isActive: partnerData.isActive ?? true,
      },
    });
    // derive partner/user names and partnerId if not provided
    const derivedPartnerId = await generateUniquePartnerNumber();

    const partner = await prisma.partner.create({
      data: {
        userId: user.id,
        partnerId: derivedPartnerId,
        companyName: partnerData.companyName ?? "",
        contactPerson: partnerData.contactPerson ?? partnerData.fullName ?? "",
        alternateNumber: partnerData.alternateNumber ?? "",
        panNumber: partnerData.panNumber,
        gstNumber: partnerData.gstNumber ?? null,
        establishedYear: partnerData.establishedYear ?? null,
        partnerType: (partnerData.partnerType ?? "INDIVIDUAL") as any,
        businessNature: partnerData.businessNature ?? null,

        fullAddress: partnerData.fullAddress,
        city: partnerData.city,
        state: partnerData.state,
        pinCode: partnerData.pinCode,
        designation: partnerData.designation,
        businessCategory: partnerData.businessCategory ?? "",
        specialization: partnerData.specialization ?? "",
        totalEmployees: partnerData.totalEmployees,
        annualTurnover: partnerData.annualTurnover,
        businessRegistrationNumber:
          partnerData.businessRegistrationNumber ?? "",
        branchId: partnerData.branchId,

        commissionType: (partnerData.commissionType ?? "FIXED") as any,
        commissionValue: partnerData.commissionValue ?? null,
        paymentCycle: (partnerData.paymentCycle ?? "MONTHLY") as any,
        minimumPayout: partnerData.minimumPayout,
        taxDeduction: partnerData.taxDeduction,

        targetArea: partnerData.targetArea ?? "",
        totalReferrals: 0,
        activeReferrals: 0,
        commissionEarned: 0,
      },
    });

    await logAction({
      entityType: "PARTNER_COMMISSION",
      entityId: partner.id,
      action: "CREATE_COMMISSION",
      performedBy: user.id,
      branchId: partnerData.branchId,
      oldValue: null,
      newValue: {
        partner: {
          partnerId: partner.partnerId,
          companyName: partner.companyName,
          partnerType: partner.partnerType,
        },
      },
    });

    const { password: _pw, ...safeUser } = user as any;
    return { user: safeUser, partner };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Partner with this unique field already exists");
    }
    throw error;
  }
}

export const getAllPartnerService = async (params: {
  page?: number;
  limit?: number;
  q?: string;
}) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);

  const where = {
    ...buildPartnerSearch(params.q),
  };
  const [data, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      include: {
        user: true,
      },
      skip,
      take: limit,
    }),
    prisma.partner.count({ where }),
  ]);
  return {
    data: data.map((partner) => {
      const { password, ...safeUser } = partner.user;
      return {
        ...partner,
        user: safeUser,
      };
    }),
    meta: {
      total,
      page,
      limit,
    },
  };
};

export const getPartnerByIdService = async (id: string) => {
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
  if (partner) {
    const { password, ...safeUser } = partner.user;
    return {
      ...partner,
      user: safeUser,
    };
  }
  if (!partner) {
    throw new Error("Partner not found");
  }
};

export const updatePartnerService = async (id: string, updateData: any) => {
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!partner) {
    const e: any = new Error("Partner not found");
    e.statusCode = 404;
    throw e;
  }

  const userUpdateData: Record<string, any> = {};
  const partnerUpdateData: Record<string, any> = {};

  // user-scoped fields (do NOT allow updating `role` or `userName` here)
  const userFields = [
    "fullName",
    "email",
    "password",
    "contactNumber",
    "isActive",
  ];

  for (const key of userFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      (userUpdateData as any)[key] = (updateData as any)[key];
      continue;
    }
    if (
      updateData &&
      typeof updateData.user === "object" &&
      Object.prototype.hasOwnProperty.call(updateData.user, key)
    ) {
      (userUpdateData as any)[key] = (updateData.user as any)[key];
    }
  }

  // hash password if provided
  if (userUpdateData.password) {
    userUpdateData.password = await hashPassword(userUpdateData.password);
  }

  // Prevent role and userName updates via this service regardless of input
  if ((userUpdateData as any).role) delete (userUpdateData as any).role;
  if ((userUpdateData as any).userName) delete (userUpdateData as any).userName;

  const partnerFields = ["partnerType", "experience", "targetArea"];
  for (const key of partnerFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      (partnerUpdateData as any)[key] = (updateData as any)[key];
    }
  }

  await prisma.user.update({
    where: { id: partner.userId },
    data: {
      ...userUpdateData,
    },
  });

  const updatedPartnerRecord = await prisma.partner.update({
    where: { id },
    data: {
      ...partnerUpdateData,
    },
  });

  await logAction({
    entityType: "PARTNER_COMMISSION",
    entityId: id,
    action: "UPDATE_COMMISSION",
    performedBy: partner.userId,
    branchId: partner.branchId,
    oldValue: {
      user: partner.user,
      partner: {
        partnerType: partner.partnerType,
        targetArea: partner.targetArea,
      },
    },
    newValue: {
      user: userUpdateData,
      partner: partnerUpdateData,
    },
  });

  const updatedPartner = await getPartnerByIdService(id);
  return updatedPartner;
};

export const createPartnerLeadService = async (
  data: z.infer<typeof createLeadSchema>,
  userId: string,
) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { userId },
    });
    if (!partner) {
      const e: any = new Error("Partner not found for the authenticated user");
      e.statusCode = 404;
      throw e;
    }
    const leadNumber = await generateUniqueLeadNumber();

    const lead = await prisma.leads.create({
      data: {
        fullName: data.fullName,
        contactNumber: data.contactNumber,
        email: data.email,
        dob: data.dob,
        gender: data.gender,
        loanAmount: data.loanAmount,
        loanTypeId: data.loanTypeId,
        city: data.city ?? "",
        state: data.state ?? "",
        pinCode: data.pinCode ?? "",
        address: data.address ?? "",
        leadNumber,
        partnerId: partner.id,
        assignedTo: data.assignedTo ?? undefined,
        assignedBy: data.assignedBy ?? undefined,
        status: data.status as any,
      },
    });

    return lead;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    const e: any = new Error(error.message || "Failed to create lead");
    e.statusCode = 500;
    throw e;
  }
};

export const getPartnerDashboardService = async (partnerId: string) => {
  const totalLeads = await prisma.leads.count({
    where: { partnerId },
  });

  const approvedLoans = await prisma.loanApplication.count({
    where: {
      lead: { partnerId },
      status: "approved",
    },
  });

  const disbursedAmount = await prisma.loanApplication.aggregate({
    where: {
      lead: { partnerId },
      status: "approved",
    },
    _sum: { approvedAmount: true },
  });

  const commission = await prisma.partnerCommission.aggregate({
    where: { partnerId },
    _sum: { commissionAmount: true },
  });

  return {
    totalLeads,
    approvedLoans,
    conversionRate: totalLeads === 0 ? 0 : (approvedLoans / totalLeads) * 100,
    totalDisbursed: disbursedAmount._sum.approvedAmount ?? 0,
    totalCommissionEarned: commission._sum.commissionAmount ?? 0,
  };
};

export const getPartnerCommissionsService = async (partnerId: string) => {
  return prisma.partnerCommission.findMany({
    where: { partnerId },
    include: {
      loan: {
        select: {
          loanNumber: true,
          approvedAmount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export async function createPartnerLoanApplicationService(
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

    /* -------- Get branchId from user record -------- */
    const user = await prisma.user.findUnique({
      where: { id: loggedInUser.id },
      select: { branchId: true },
    });

    if (!user?.branchId) {
      throw new Error("User branch information not found");
    }

    const partner =
      loggedInUser.role === "PARTNER"
        ? await prisma.partner.findUnique({
            where: { userId: loggedInUser.id },
            select: { id: true },
          })
        : null;

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
          partnerId: partner?.id,
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
          branchId: user.branchId,
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

      await logAction({
        entityType: "LOAN",
        entityId: loanApplication.id,
        action: "CREATE_LOAN",
        performedBy: loggedInUser.id,
        branchId: loanApplication.branchId,
        oldValue: null,
        newValue: {
          loanApplication: {
            status: "kyc_pending",
          },
        },
      });
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

export const createChildPartnerService = async (
  parentUserId: string,
  data: CreatePartner,
) => {
  return prisma.$transaction(async (tx) => {
    const parentPartner = await tx.partner.findUnique({
      where: { userId: parentUserId },
    });
    if (!parentPartner) {
      const e: any = new Error(
        "Parent partner not found for the authenticated user",
      );
      e.statusCode = 404;
      throw e;
    }

    const existing = await tx.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      const e: any = new Error("User with this email already exists");
      e.statusCode = 409;
      throw e;
    }
    const hashedPassword = await hashPassword(data.password);
    const user = await tx.user.create({
      data: {
        fullName: data.fullName,
        userName: data.userName,
        email: data.email,
        password: hashedPassword,
        role: "PARTNER",
        contactNumber: data.contactNumber ?? "",
        branchId: parentPartner.branchId,
        isActive: data.isActive ?? true,
      },
    });
    const partner = await tx.partner.create({
      data: {
        userId: user.id,
        partnerId: await generateUniquePartnerNumber(),
        companyName: data.companyName ?? "",
        contactPerson: data.contactPerson ?? data.fullName ?? "",
        alternateNumber: data.alternateNumber ?? "",
        panNumber: data.panNumber,
        gstNumber: data.gstNumber ?? null,
        establishedYear: data.establishedYear ?? null,
        partnerType: (data.partnerType ?? "INDIVIDUAL") as any,
        businessNature: data.businessNature ?? null,
        commissionType: (data.commissionType ?? "FIXED") as any,
        commissionValue: data.commissionValue ?? null,
        paymentCycle: (data.paymentCycle ?? "MONTHLY") as any,
        minimumPayout: data.minimumPayout,
        taxDeduction: data.taxDeduction,
        targetArea: data.targetArea ?? "",
        parentPartnerId: parentPartner.id,
        branchId: parentPartner.branchId,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        designation: data.designation,
        businessCategory: data.businessCategory ?? "",
        specialization: data.specialization ?? "",
        totalEmployees: data.totalEmployees,
        annualTurnover: data.annualTurnover,
        businessRegistrationNumber: data.businessRegistrationNumber ?? "",
      },
    });

    const { password: _pw, ...safeUser } = user as any;
    return {
      parentPartnerId: parentPartner.id,
      childPartner: partner,
      user: safeUser,
    };
  });
};
