-- CreateTable
CREATE TABLE `NachMandate` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `ifscCode` VARCHAR(191) NOT NULL,
    `maxDebitAmount` DOUBLE NOT NULL,
    `StartDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `failureCount` INTEGER NOT NULL DEFAULT 0,
    `lastDebitDate` DATETIME(3) NULL,

    INDEX `NachMandate_loanApplicationId_idx`(`loanApplicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NachDebit` (
    `id` VARCHAR(191) NOT NULL,
    `mandateId` VARCHAR(191) NOT NULL,
    `emiId` VARCHAR(191) NOT NULL,
    `debitAmount` DOUBLE NOT NULL,
    `debitDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `bankReferenceId` VARCHAR(191) NULL,
    `failureReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NachDebit_mandateId_idx`(`mandateId`),
    INDEX `NachDebit_emiId_idx`(`emiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NachMandate` ADD CONSTRAINT `NachMandate_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NachMandate` ADD CONSTRAINT `NachMandate_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NachDebit` ADD CONSTRAINT `NachDebit_mandateId_fkey` FOREIGN KEY (`mandateId`) REFERENCES `NachMandate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NachDebit` ADD CONSTRAINT `NachDebit_emiId_fkey` FOREIGN KEY (`emiId`) REFERENCES `LoanEmiSchedule`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
