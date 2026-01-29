import { prisma } from "../../db/prismaService.js";

import path from "path";
import fs from "fs";

export async function uploadDocumentsService(
  target: "loan" | "coApplicant",
  targetId: string,
  documents: {
    documentType: string;
    documentPath: string;
    uploadedBy: string;
  }[],
) {
  return prisma.$transaction(async (tx) => {
    let kycId: string | null = null;
    let whereClause: any = {};

    /* 1️⃣ Resolve KYC + where condition */
    if (target === "loan") {
      const loan = await tx.loanApplication.findUnique({
        where: { id: targetId },
        select: { kyc: { select: { id: true } } },
      });
      if (!loan || !loan.kyc) throw new Error("Loan or KYC not found");

      kycId = loan.kyc.id;
      whereClause = { loanApplicationId: targetId };
    }

    if (target === "coApplicant") {
      const co = await tx.coApplicant.findUnique({
        where: { id: targetId },
        select: { kyc: { select: { id: true } } },
      });
      if (!co || !co.kyc) throw new Error("CoApplicant or KYC not found");

      kycId = co.kyc.id;
      whereClause = { coApplicantId: targetId };
    }

    /* 2️⃣ Check already uploaded document types */
    const existingDocs = await tx.document.findMany({
      where: whereClause,
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

    /* 3️⃣ Insert documents */
    await tx.document.createMany({
      data: documents.map((doc) => ({
        documentType: doc.documentType,
        documentPath: doc.documentPath,
        uploadedBy: doc.uploadedBy,
        kycId,
        loanApplicationId: target === "loan" ? targetId : undefined,
        coApplicantId: target === "coApplicant" ? targetId : undefined,
      })),
    });

    /* 4️⃣ Return documents */
    return tx.document.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });
  });
}

export async function reuploadCoApplicantDocumentService(
  coApplicantId: string,
  documentType: string,
  file: {
    filename: string;
    path: string;
    uploadedBy: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    /* 1️⃣ Find existing document */
    const existingDoc = await tx.document.findFirst({
      where: {
        coApplicantId,
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

      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
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
} 


export const getAllCoApplicantInLoanService = async (loanApplicationId: string) => {
    const coApplicants = await prisma.coApplicant.findMany({
        where: { loanApplicationId },
        include:{documents: true},
    });
    return coApplicants;
}
