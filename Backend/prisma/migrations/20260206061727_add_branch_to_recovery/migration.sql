/*
  Warnings:

  - Added the required column `branchId` to the `LoanRecovery` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `loanrecovery` ADD COLUMN `branchId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `LoanRecovery_branchId_idx` ON `LoanRecovery`(`branchId`);

-- AddForeignKey
ALTER TABLE `LoanRecovery` ADD CONSTRAINT `LoanRecovery_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
