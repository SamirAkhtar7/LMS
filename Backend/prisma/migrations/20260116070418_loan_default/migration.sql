-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `defaultedAt` DATETIME(3) NULL,
    ADD COLUMN `dpd` INTEGER NULL,
    MODIFY `status` ENUM('draft', 'submitted', 'kyc_pending', 'credit_check', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'closed', 'delinquent', 'written_off', 'defaulted', 'application_in_progress') NOT NULL DEFAULT 'application_in_progress';

-- CreateTable
CREATE TABLE `loan_recoveries` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `recoveryStage` ENUM('INITIAL_CONTACT', 'NEGOTIATION', 'LEGAL_ACTION', 'SETTLEMENT', 'CLOSED') NOT NULL,
    `recoveryStatus` ENUM('ONGOING', 'IN_PROGRESS', 'RESOLVED', 'WRITE_OFF', 'COMPLETED') NOT NULL,
    `tolalOutstandingAmount` DOUBLE NOT NULL,
    `recoveredAmount` DOUBLE NOT NULL,
    `balanceAmount` DOUBLE NOT NULL,
    `dpd` INTEGER NOT NULL,
    `defaultedAt` DATETIME(3) NULL,
    `assigedTo` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recoveryPayments` (
    `id` VARCHAR(191) NOT NULL,
    `loanRecoveryId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `paymentMode` ENUM('upi', 'nach', 'net_banking', 'cash', 'cheque') NOT NULL,
    `referenceNo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
