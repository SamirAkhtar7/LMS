/*
  Warnings:

  - You are about to drop the column `loanType` on the `leads` table. All the data in the column will be lost.
  - You are about to drop the column `loanType` on the `loanapplication` table. All the data in the column will be lost.
  - Added the required column `loanTypeId` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leads` DROP COLUMN `loanType`,
    ADD COLUMN `loanTypeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `loanapplication` DROP COLUMN `loanType`,
    ADD COLUMN `loanTypeId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `LoanType` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `category` ENUM('PERSONAL_LOAN', 'VEHICLE_LOAN', 'HOME_LOAN', 'EDUCATION_LOAN', 'BUSINESS_LOAN', 'GOLD_LOAN') NOT NULL,
    `secured` BOOLEAN NOT NULL DEFAULT false,
    `minAmount` DOUBLE NOT NULL,
    `maxAmount` DOUBLE NOT NULL,
    `minTenureMonths` INTEGER NOT NULL,
    `maxTenureMonths` INTEGER NOT NULL,
    `interestType` ENUM('FLAT', 'REDUCING') NOT NULL,
    `minInterestRate` DOUBLE NOT NULL,
    `maxInterestRate` DOUBLE NOT NULL,
    `defaultInterestRate` DOUBLE NOT NULL,
    `processingFeeType` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `processingFee` DOUBLE NOT NULL,
    `gstApplicable` BOOLEAN NOT NULL DEFAULT true,
    `gestPercentage` DOUBLE NULL,
    `minAge` INTEGER NOT NULL,
    `maxAge` INTEGER NOT NULL,
    `minIncome` DOUBLE NULL,
    `employmentTypes` ENUM('salaried', 'self_employed', 'business') NULL,
    `miniCibilScore` INTEGER NULL,
    `maxCibilScore` INTEGER NULL,
    `maxLoanToValueRatio` DOUBLE NULL,
    `prepaymentAllowed` BOOLEAN NOT NULL DEFAULT true,
    `foreclosureAllowed` BOOLEAN NOT NULL DEFAULT true,
    `perpaymentCharges` DOUBLE NULL,
    `foreclosureCharges` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `approvalRequired` BOOLEAN NOT NULL DEFAULT true,
    `estimatedProcessingTimeDays` INTEGER NULL,
    `documentsRequired` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LoanType_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Leads` ADD CONSTRAINT `Leads_loanTypeId_fkey` FOREIGN KEY (`loanTypeId`) REFERENCES `LoanType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoanApplication` ADD CONSTRAINT `LoanApplication_loanTypeId_fkey` FOREIGN KEY (`loanTypeId`) REFERENCES `LoanType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
