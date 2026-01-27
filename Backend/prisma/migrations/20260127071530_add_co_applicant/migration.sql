/*
  Warnings:

  - You are about to drop the column `coApplicantAadhaar` on the `loanapplication` table. All the data in the column will be lost.
  - You are about to drop the column `coApplicantContact` on the `loanapplication` table. All the data in the column will be lost.
  - You are about to drop the column `coApplicantIncome` on the `loanapplication` table. All the data in the column will be lost.
  - You are about to drop the column `coApplicantName` on the `loanapplication` table. All the data in the column will be lost.
  - You are about to drop the column `coApplicantPan` on the `loanapplication` table. All the data in the column will be lost.
  - You are about to drop the column `coApplicantRelation` on the `loanapplication` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` ADD COLUMN `coApplicantId` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `loanapplication` DROP COLUMN `coApplicantAadhaar`,
    DROP COLUMN `coApplicantContact`,
    DROP COLUMN `coApplicantIncome`,
    DROP COLUMN `coApplicantName`,
    DROP COLUMN `coApplicantPan`,
    DROP COLUMN `coApplicantRelation`;

-- CreateTable
CREATE TABLE `CoApplicant` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `LastName` VARCHAR(191) NOT NULL,
    `middleName` VARCHAR(191) NULL,
    `relation` ENUM('SPOUSE', 'PARTNER', 'BUSINESS_PARTNER', 'FATHER', 'MOTHER', 'SIBLING', 'FRIEND', 'OTHER') NOT NULL,
    `contactNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `dob` DATETIME(3) NOT NULL,
    `panNumber` VARCHAR(191) NULL,
    `aadhaarNumber` VARCHAR(191) NULL,
    `employmentType` ENUM('salaried', 'self_employed', 'business') NOT NULL,
    `monthlyIncome` DOUBLE NULL,
    `kycId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CoApplicant_kycId_key`(`kycId`),
    INDEX `CoApplicant_loanApplicationId_idx`(`loanApplicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_coApplicantId_fkey` FOREIGN KEY (`coApplicantId`) REFERENCES `CoApplicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoApplicant` ADD CONSTRAINT `CoApplicant_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoApplicant` ADD CONSTRAINT `CoApplicant_kycId_fkey` FOREIGN KEY (`kycId`) REFERENCES `Kyc`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
