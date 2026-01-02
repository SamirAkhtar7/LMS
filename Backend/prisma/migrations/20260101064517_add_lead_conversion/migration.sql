-- AlterTable
ALTER TABLE `leads` ADD COLUMN `convertedLoanApplicationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `leadId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `LoanApplication` ADD CONSTRAINT `LoanApplication_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Leads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
