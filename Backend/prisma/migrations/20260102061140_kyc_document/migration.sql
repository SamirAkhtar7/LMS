/*
  Warnings:

  - A unique constraint covering the columns `[kycId]` on the table `LoanApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `document` DROP FOREIGN KEY `Document_loanApplicationId_fkey`;

-- DropIndex
DROP INDEX `Document_loanApplicationId_fkey` ON `document`;

-- AlterTable
ALTER TABLE `document` MODIFY `loanApplicationId` VARCHAR(191) NULL,
    MODIFY `verificationStatus` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `kycId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `LoanApplication_kycId_key` ON `LoanApplication`(`kycId`);

-- AddForeignKey
ALTER TABLE `LoanApplication` ADD CONSTRAINT `LoanApplication_kycId_fkey` FOREIGN KEY (`kycId`) REFERENCES `Kyc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kyc` ADD CONSTRAINT `Kyc_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
