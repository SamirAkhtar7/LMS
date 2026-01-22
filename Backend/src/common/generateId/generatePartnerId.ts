import { prisma } from "../../db/prismaService.js";

const generateUniquePartnerNumber = async (): Promise<string> => {
  let attempts = 0;

  while (attempts < 5) {
    const number = Math.floor(10000 + Math.random() * 90000); // 4-digit
    const partnerNumber = `PRT-${number}`;

    const exists = await prisma.partner.findUnique({
      where: { partnerId: partnerNumber },
      select: { id: true },
    });

    if (!exists) return partnerNumber;

    attempts++;
  }

  const err: any = new Error("Failed to generate unique partner number");
  err.statusCode = 500;
  throw err;
};

export { generateUniquePartnerNumber };
