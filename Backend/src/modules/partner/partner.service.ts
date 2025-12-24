import { prisma } from "../../db/prismaService.js";
import { hashPassword } from "../../common/utils/utils.js";
import { CreatePartner } from "./partner.types.js";


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
                email: partnerData.email,
                password: hashedPassword,
                role: "PARTNER",
                phone: partnerData.phone,
                isActive: partnerData.isActive ?? true,
            },

        })
        const partner =  await prisma.partner.create({
            data: {
                userId: user.id,
                partnerType: partnerData.partnerType,
                experience: partnerData.experience,
                targetArea: partnerData.targetArea,
            },
        });
        return { user, partner };

    }
    catch (error: any) {
        if (error.code === "P2002") {
            throw new Error("Partner with this unique field already exists");
        }
        throw error;
    }

}


export const getAllPartnerService = async () => {
  // Implementation for retrieving all partners
  const partners = await prisma.partner.findMany({
    include: {
      user: true,
    },
  });
    const safePartners = partners.map((partner) => {
        const { password, ...safeUser } = partner.user;
        return {
            ...partner,
            user: safeUser,
        };
    });
    return safePartners;
}



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
}



export const updatePartnerService = async (id: string, updateData: any) => {

const partner = await prisma.partner.findUnique({ where: { id } });

  if (!partner) {
    const e: any = new Error("Partner not found");
    e.statusCode = 404;
    throw e;
    }
   
    const userUpdateData: Record<string, any> = {};
    const partnerUpdateData: Record<string, any> = {};

    // user-scoped fields
    const userFields = [
      "fullName",
      "email",
      "password",
      "phone",
      "isActive",
    ];

    for (const key of userFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        (userUpdateData as any)[key] = (updateData as any)[key];
        }
        if (userUpdateData.password) {
            userUpdateData.password = await hashPassword(userUpdateData.password);
        }
    }

    const partnerFields = [
      "partnerType",
      "experience",
      "targetArea",
    ];
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
}