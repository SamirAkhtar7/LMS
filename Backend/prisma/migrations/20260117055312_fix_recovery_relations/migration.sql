/*
  Warnings:

  - You are about to drop the `loanrecoveries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recoverypayments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `totalPayableAmount` to the `LoanEmiSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `loanemischedule` ADD COLUMN `totalPayableAmount` DOUBLE NOT NULL;

-- DropTable
DROP TABLE `loanrecoveries`;

-- DropTable
DROP TABLE `recoverypayments`;

-- CreateTable
CREATE TABLE `LoanRecovery` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `recoveryStage` ENUM('INITIAL_CONTACT', 'NEGOTIATION', 'LEGAL_ACTION', 'SETTLEMENT', 'CLOSED') NOT NULL,
    `recoveryStatus` ENUM('ONGOING', 'IN_PROGRESS', 'RESOLVED', 'WRITE_OFF', 'COMPLETED') NOT NULL,
    `totalOutstandingAmount` DOUBLE NOT NULL,
    `recoveredAmount` DOUBLE NOT NULL,
    `balanceAmount` DOUBLE NOT NULL,
    `dpd` INTEGER NOT NULL,
    `defaultedAt` DATETIME(3) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LoanRecovery_loanApplicationId_idx`(`loanApplicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecoveryPayment` (
    `id` VARCHAR(191) NOT NULL,
    `loanRecoveryId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `paymentMode` ENUM('CASH', 'UPI', 'BANK', 'CHEQUE') NOT NULL,
    `referenceNo` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RecoveryPayment_loanRecoveryId_idx`(`loanRecoveryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LoanRecovery` ADD CONSTRAINT `LoanRecovery_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecoveryPayment` ADD CONSTRAINT `RecoveryPayment_loanRecoveryId_fkey` FOREIGN KEY (`loanRecoveryId`) REFERENCES `LoanRecovery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
