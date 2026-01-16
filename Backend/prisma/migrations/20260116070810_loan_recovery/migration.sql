/*
  Warnings:

  - You are about to drop the `loan_recoveries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `loan_recoveries`;

-- CreateTable
CREATE TABLE `loanRecoveries` (
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
