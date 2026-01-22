import { prisma } from "../../db/prismaService.js";

const generateUniqueLeadNumber = async (): Promise<string> => {
  let attempts = 0;

  while (attempts < 5) {
    const number = Math.floor(100000 + Math.random() * 900000); // 6-digit: 100000-999999
    const leadNumber = `LEAD-${number}`;

    const exists = await prisma.leads.findUnique({
      where: { leadNumber },
      select: { id: true },
    });

    if (!exists) return leadNumber;

    attempts++;
  }

  const err: any = new Error("Failed to generate unique lead number");
  err.statusCode = 500;
  throw err;
};


export { generateUniqueLeadNumber };