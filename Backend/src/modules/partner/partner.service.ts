import { prisma } from "../../db/prismaService.js";
import { hashPassword } from "../../common/utils/utils.js";
import { CreatePartner } from "./partner.types.js";
import { generateUniquePartnerNumber } from "../../common/generateId/generatePartnerId.js";
import { getPagination } from "../../common/utils/pagination.js";
import { buildPartnerSearch } from "../../common/utils/search.js";

export async function createPartnerService(partnerData: CreatePartner) {
  const existing = await prisma.user.findUnique({
    where: { email: partnerData.email },
  });
  if (existing) {
    throw new Error("User with this email already exists");
  }
  try {
    const hashedPassword = await hashPassword(partnerData.password);
    const user = await prisma.user.create({
      data: {
        fullName: partnerData.fullName,
        userName: partnerData.userName,
        email: partnerData.email,
        password: hashedPassword,
        role: "PARTNER",
        contactNumber: partnerData.contactNumber ?? "",
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
        website: partnerData.website ?? "",
        establishedYear: partnerData.establishedYear ?? null,
        partnerType: (partnerData.partnerType ?? "INDIVIDUAL") as any,
        businessNature: partnerData.businessNature ?? null,

        fullAddress: partnerData.fullAddress ?? null,
        city: partnerData.city ?? null,
        state: partnerData.state ?? null,
        pinCode: partnerData.pinCode ?? "",
        designation: partnerData.designation ?? "",
        businessCategory: partnerData.businessCategory ?? "",
        specialization: partnerData.specialization ?? "",
        totalEmployees: partnerData.totalEmployees,
        annualTurnover: partnerData.annualTurnover,
        businessRegistrationNumber:
          partnerData.businessRegistrationNumber ?? "",

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
    }
    ),
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
  const partner = await prisma.partner.findUnique({ where: { id } });

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

  await prisma.partner.update({
    where: { id },
    data: {
      ...partnerUpdateData,
    },
  });
  const updatedPartner = await getPartnerByIdService(id);
  return updatedPartner;
};
