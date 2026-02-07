import { hashPassword } from "../src/common/utils/utils.ts";
import { prisma } from "../src/db/prismaService.ts";
import { PERMISSIONS } from "../src/common/constants/permission.ts";
import { skip } from "node:test";

async function main(): Promise<void> {
  const now: Date = new Date();

  const permissions = await Promise.all(
    PERMISSIONS.map(async (code) => {
      return prisma.permission.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: code.replace(/_/g, " "),
        },
      });
    }),
  );

  // Create Super Branch for admin users
  const superBranch = await prisma.branch.upsert({
    where: { code: "HQ-SUPER" },
    update: {},
    create: {
      name: "Headquarters - Super Admin",
      code: "HQ-SUPER",
      type: "MAIN",
      isActive: true,
    },
  });

  let password: string = "Admin@123";
  password = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName: "Samir Akhtar",
      email: "admin@gmail.com",
      userName: "admin123",
      password,
      role: "ADMIN",
      contactNumber: "9999999999",
      branchId: superBranch.id,
      isActive: true,
      // kycStatus: "VERIFIED",
      createdAt: now,
    },
  });

  console.log(" Seed completed successfully:", user);
  console.log(" Super Branch created:", superBranch);
}

// Run the script
main()
  .catch((e: unknown) => {
    console.error("Seeding error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
