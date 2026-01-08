/*
  Warnings:

  - Made the column `loanTypeId` on table `loanapplication` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `loanapplication` DROP FOREIGN KEY `LoanApplication_loanTypeId_fkey`;

-- DropIndex
DROP INDEX `LoanApplication_loanTypeId_fkey` ON `loanapplication`;

-- AlterTable
ALTER TABLE `document` ADD COLUMN `rejectionReason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `loanapplication` MODIFY `loanTypeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `LoanApplication` ADD CONSTRAINT `LoanApplication_loanTypeId_fkey` FOREIGN KEY (`loanTypeId`) REFERENCES `LoanType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
