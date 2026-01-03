import { th } from "zod/locales";
import logger from "../../common/logger.js";
import { prisma } from "../../db/prismaService.js";

export const uploadKycDocumentService = async (data: {
  kycId?: string;
  documentType: string;
  documentPath: string;
  uploadedBy: string;
  loanApplicationId?: string;
  verificationStatus?: "pending" | "verified" | "rejected";
}) => {
  try {
    // Resolve kycId from loanApplicationId when not provided
    let kycId: string | undefined = data.kycId;
    if (!kycId && data.loanApplicationId) {
      const la = await prisma.loanApplication.findUnique({
        where: { id: data.loanApplicationId },
        select: { kycId: true },
      });
      kycId = la?.kycId ?? undefined;
    }
    const kycDocument = await prisma.document.create({
      data: {
        kycId: kycId ?? undefined,
        documentType: data.documentType,
        documentPath: data.documentPath,
        uploadedBy: data.uploadedBy,
        loanApplicationId: data.loanApplicationId ?? undefined,
        verificationStatus: data.verificationStatus ?? "pending",
      },
    });
    return kycDocument;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const verifyDocumentService = async (
  documentId: string,
  userId: string
) => {
  try {
    const Document = await prisma.document.update({
      where: { id: documentId },
      data: {
        verified: true,
        verifiedBy: userId,
        verifiedAt: new Date(),
        verificationStatus: "verified",
      },
    });

    // If document is linked to a KYC, check if all documents are verified and update KYC status
    if (Document.kycId) {
      const remaining = await prisma.document.count({
        where: {
          kycId: Document.kycId,
          verificationStatus: { not: "verified" },
        },
      });

      if (remaining === 0) {
        const updatedKyc = await prisma.kyc.update({
          where: { id: Document.kycId },
          data: {
            status: "VERIFIED",
            verifiedBy: userId,
            verifiedAt: new Date(),
          },
        });

        // Also transition the related loan application to the next stage
        // if it is currently waiting for KYC.
        if (updatedKyc.id) {
          await prisma.loanApplication.updateMany({
            where: { kycId: updatedKyc.id as string, status: "kyc_pending" },
            data: { status: "application_in_progress" },
          });
        }
      }
    }

    return Document;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const updateKycStatusService = async (
  kycId: string,
  status: "PENDING" | "VERIFIED" | "REJECTED",
  remarks?: string
) => {
  try {
    const kycRecord = await prisma.kyc.update({
      where: {
        id: kycId,
      },
      data: {
        status: status,
        remarks: remarks,
        verifiedAt: status === "VERIFIED" ? new Date() : null,
      },
    });
    return kycRecord;
  } catch (error) {
    logger.error(error);
  }
};



// const uploadKycDocumentService =async (data)