import { prisma } from "../../db/prismaService.js";

const generateUniqueEmployeeId = async (): Promise<string> => {
  let attempts = 0;

  while (attempts < 5) {
    const number = Math.floor(100000 + Math.random() * 9000); // 4-digit
    const employeeId = `EMP-${number}`;

    const exists = await prisma.employee.findUnique({
      where: { employeeId },
      select: { id: true },
    });

    if (!exists) return employeeId;

    attempts++;
  }

  const err: any = new Error("Failed to generate unique employee ID");
  err.statusCode = 500;
  throw err;
};

export { generateUniqueEmployeeId };
