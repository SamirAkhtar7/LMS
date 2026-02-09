import logger from "../../common/logger.js";
import { getAccessibleBranchIds } from "../../common/utils/branchAccess.js";
import { buildBranchFilter } from "../../common/utils/branchFilter.js";
import { getPagination } from "../../common/utils/pagination.js";
import { buildKycSearch } from "../../common/utils/search.js";
import { prisma } from "../../db/prismaService.js";

export const uploadKycDocumentService = async (data: {
  userId: string;
  documents: {
    documentType: string;
    documentPath: string;
  }[];
  branchId?: string;
}) => {
  const { userId, documents, branchId } = data;
  try {
    // Resolve kycId from loanApplicationId when not provided
    return prisma.$transaction(async (tx) => {
      let kyc = await tx.kyc.findFirst({
        where: { userId },
      });

      if (!kyc) {
        kyc = await tx.kyc.create({
          data: {
            userId,
            status: "PENDING",
          },
        });
      }

      // Get user's branchId if not provided
      let documentBranchId = branchId;
      if (!documentBranchId) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { branchId: true },
        });
        documentBranchId = user?.branchId || "";
      }

      const saveDocuments = await Promise.all(
        documents.map((doc) =>
          tx.document.create({
            data: {
              kycId: kyc.id,
              documentType: doc.documentType,
              documentPath: doc.documentPath,
              uploadedBy: userId,
              branchId: documentBranchId,
            },
          }),
        ),
      );
      return { kyc, documents: saveDocuments };
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const verifyDocumentService = async (
  documentId: string,
  adminId: string,
) => {
  try {
    return prisma.$transaction(async (tx) => {
      // Ensure the document exists before attempting update
      const existingDoc = await tx.document.findUnique({
        where: { id: documentId },
      });
      if (!existingDoc) {
        const err: any = new Error("Document not found");
        err.statusCode = 404;
        throw err;
      }

      // Mark the single document as verified
      const document = await tx.document.update({
        where: { id: documentId },
        data: {
          verified: true,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          verificationStatus: "verified",
        },
      });

      // If the document is linked to a KYC, check remaining unverified documents
      if (document.kycId) {
        const unverifiedCount = await tx.document.count({
          where: {
            kycId: document.kycId,
            verificationStatus: { not: "verified" },
          },
        });

        if (unverifiedCount === 0) {
          const updatedKyc = await tx.kyc.update({
            where: { id: document.kycId },
            data: {
              status: "VERIFIED",
              verifiedBy: adminId,
              verifiedAt: new Date(),
            },
          });

          await tx.user.update({
            where: { id: updatedKyc.userId },
            data: { kycStatus: "VERIFIED" },
          });
        }
      }

      return document;
    });
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export async function getMyKycService(userId: string) {
  return prisma.kyc.findFirst({
    where: { userId },
    include: { documents: true },
  });
}

export const getAllKycService = async (
  params: {
    page?: number;
    limit?: number;
    q?: string;
  },
  user: {
    id: string;
    role: string;
    branchId?: string;
  },
) => {
  const { page, limit, skip } = getPagination(params.page, params.limit);
  const accessibleBranches = await getAccessibleBranchIds({
    id: user.id,
    role: user.role,
    branchId: user.branchId,
  });
  const where = {
    ...buildKycSearch(params.q),
    ...buildBranchFilter(accessibleBranches),
  };

  const [data, total] = await Promise.all([
    prisma.kyc.findMany({
      where,
      include: { documents: true, user: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.kyc.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
