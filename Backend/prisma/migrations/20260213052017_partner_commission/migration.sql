/*
  Warnings:

  - You are about to drop the column `website` on the `partner` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `panNumber` to the `Partner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leads` ADD COLUMN `partnerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `partner` DROP COLUMN `website`,
    ADD COLUMN `branchId` VARCHAR(191) NOT NULL,
    ADD COLUMN `gstNumber` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `panNumber` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `PartnerCommission` (
    `id` VARCHAR(191) NOT NULL,
    `partnerId` VARCHAR(191) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `approvedAmount` DOUBLE NOT NULL,
    `commissionType` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `commissionValue` DOUBLE NOT NULL,
    `commissionAmount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PAID') NOT NULL DEFAULT 'PENDING',
    `calculatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `paidAt` DATETIME(3) NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PartnerCommission_partnerId_idx`(`partnerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Partner` ADD CONSTRAINT `Partner_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerCommission` ADD CONSTRAINT `PartnerCommission_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PartnerCommission` ADD CONSTRAINT `PartnerCommission_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Leads` ADD CONSTRAINT `Leads_partnerId_fkey` FOREIGN KEY (`partnerId`) REFERENCES `Partner`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
