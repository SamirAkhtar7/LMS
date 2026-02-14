/*
  Warnings:

  - A unique constraint covering the columns `[loanId]` on the table `PartnerCommission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `partnerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PartnerCommission_loanId_key` ON `PartnerCommission`(`loanId`);

-- AddForeignKey
ALTER TABLE `LoanApplication` ADD CONSTRAINT `LoanApplication_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
