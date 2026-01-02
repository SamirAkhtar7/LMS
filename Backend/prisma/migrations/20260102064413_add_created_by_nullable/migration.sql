-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `createdById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `LoanApplication` ADD CONSTRAINT `LoanApplication_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
