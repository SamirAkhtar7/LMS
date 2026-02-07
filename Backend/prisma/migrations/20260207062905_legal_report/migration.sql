-- DropForeignKey
ALTER TABLE `legalreport` DROP FOREIGN KEY `LegalReport_loanApplicationId_fkey`;

-- AlterTable
ALTER TABLE `legalreport` MODIFY `loanApplicationId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `LegalReport` ADD CONSTRAINT `LegalReport_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
