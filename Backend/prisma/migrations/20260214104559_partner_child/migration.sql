-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `ownerPartnerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `partner` ADD COLUMN `parentPartnerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Partner` ADD CONSTRAINT `Partner_parentPartnerId_fkey` FOREIGN KEY (`parentPartnerId`) REFERENCES `Partner`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
