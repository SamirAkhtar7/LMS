-- AlterTable
ALTER TABLE `customer` ADD COLUMN `accountType` VARCHAR(191) NULL,
    ADD COLUMN `category` ENUM('GENERAL', 'SC', 'ST', 'OBC', 'OTHER') NULL,
    ADD COLUMN `maritalStatus` ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER') NULL,
    ADD COLUMN `nationality` VARCHAR(191) NULL,
    ADD COLUMN `otherIncome` DOUBLE NULL,
    ADD COLUMN `spouseName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employee` MODIFY `maritalStatus` ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `coApplicantAadhaar` VARCHAR(191) NULL,
    ADD COLUMN `coApplicantContact` VARCHAR(191) NULL,
    ADD COLUMN `coApplicantIncome` DOUBLE NULL,
    ADD COLUMN `coApplicantName` VARCHAR(191) NULL,
    ADD COLUMN `coApplicantPan` VARCHAR(191) NULL,
    ADD COLUMN `coApplicantRelation` ENUM('SPOUSE', 'PARTNER', 'BUSINESS_PARTNER', 'FATHER', 'MOTHER', 'SIBLING', 'FRIEND', 'OTHER') NULL,
    ADD COLUMN `loanType` ENUM('PERSONAL_LOAN', 'VEHICLE_LOAN', 'HOME_LOAN', 'EDUCATION_LOAN', 'BUSINESS_LOAN', 'GOLD_LOAN') NULL,
    ADD COLUMN `purposeDetails` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `kycStatus` ENUM('NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `LoanEmiSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `emiNo` INTEGER NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `principalAmount` DOUBLE NOT NULL,
    `interestAmount` DOUBLE NOT NULL,
    `emiAmount` DOUBLE NOT NULL,
    `openingBalance` DOUBLE NOT NULL,
    `closingBalance` DOUBLE NOT NULL,
    `status` ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    `paidDate` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kyc` ADD CONSTRAINT `Kyc_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoanEmiSchedule` ADD CONSTRAINT `LoanEmiSchedule_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
