-- CreateTable
CREATE TABLE `LoanDisbursement` (
    `id` VARCHAR(191) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `disbursementMode` ENUM('BANK_TRANSFER', 'NEFT', 'RTGS', 'IMPS', 'CHEQUE', 'CASH', 'UPI') NOT NULL,
    `transactionReference` VARCHAR(191) NOT NULL,
    `disbursementDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedBy` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LoanDisbursement_loanId_key`(`loanId`),
    INDEX `LoanDisbursement_loanId_idx`(`loanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LoanDisbursement` ADD CONSTRAINT `LoanDisbursement_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
