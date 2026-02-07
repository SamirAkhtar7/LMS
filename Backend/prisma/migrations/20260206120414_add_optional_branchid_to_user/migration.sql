/*
  Warnings:

  - Added the required column `branchId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `LegalReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `TechnicalReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `branch` MODIFY `type` ENUM('SUPER', 'MAIN', 'SUB') NOT NULL;

-- AlterTable
ALTER TABLE `document` ADD COLUMN `branchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `legalreport` ADD COLUMN `branchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `technicalreport` ADD COLUMN `branchId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `branchId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TechnicalReport` ADD CONSTRAINT `TechnicalReport_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalReport` ADD CONSTRAINT `LegalReport_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
