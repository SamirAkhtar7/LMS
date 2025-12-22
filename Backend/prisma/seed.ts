// import { Decimal } from "@prisma/client/runtime/library";
// import prisma from "../src/db/db.js";
import { hashPassword  }from "../src/common/utils/utils.ts";
import {prisma }from "../src/db/prismaService.ts";

async function main(): Promise<void> {
  const now: Date = new Date();

  let password: string = "Admin@123";
  password = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName: "Samir Akhtar",
      email: "admin@gmail.com",
      password,
      role: "ADMIN", 
      phone: "9999999999",
      location: "Jaipur, India",
      isActive: true,
      createdAt: now,
    },
  });

  console.log(" Seed completed successfully:", user);
}

// Run the script
main()
  .catch((e: unknown) => {
    console.error("Seeding error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
