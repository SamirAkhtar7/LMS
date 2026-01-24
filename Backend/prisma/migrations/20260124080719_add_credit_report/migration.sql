-- CreateTable
CREATE TABLE `CreditReport` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `provider` ENUM('CIBIL', 'EXPERIAN', 'EQUIFAX', 'MOCK') NOT NULL,
    `bureauReferenceId` VARCHAR(191) NULL,
    `fetchedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `creditScore` INTEGER NULL,
    `scoreBand` VARCHAR(191) NULL,
    `totalAtiveLoans` INTEGER NULL,
    `totalClosedLoans` INTEGER NULL,
    `totalOutstandingLoans` DOUBLE NULL,
    `totalMonthlyEmi` DOUBLE NULL,
    `maxDPD` INTEGER NULL,
    `overdueAccounts` INTEGER NULL,
    `wittenOffCounts` INTEGER NULL,
    `settledCounts` INTEGER NULL,
    `isThinFile` BOOLEAN NOT NULL DEFAULT false,
    `isNTC` BOOLEAN NOT NULL DEFAULT false,
    `isValid` BOOLEAN NOT NULL DEFAULT true,
    `isExpired` BOOLEAN NOT NULL DEFAULT false,
    `pulledFor` VARCHAR(191) NULL,
    `rowRawData` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CreditReport_customerId_key`(`customerId`),
    INDEX `CreditReport_customerId_idx`(`customerId`),
    INDEX `CreditReport_provider_idx`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditAccount` (
    `id` VARCHAR(191) NOT NULL,
    `creditReportId` VARCHAR(191) NOT NULL,
    `lenderName` VARCHAR(191) NOT NULL,
    `accountType` VARCHAR(191) NOT NULL,
    `accountStatus` VARCHAR(191) NOT NULL,
    `sanctionedAmount` DOUBLE NULL,
    `outstanding` DOUBLE NULL,
    `emiAmount` DOUBLE NULL,
    `dpd` INTEGER NULL,
    `openedDate` DATETIME(3) NULL,
    `closedDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CreditAccount_creditReportId_idx`(`creditReportId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreditReport` ADD CONSTRAINT `CreditReport_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditAccount` ADD CONSTRAINT `CreditAccount_creditReportId_fkey` FOREIGN KEY (`creditReportId`) REFERENCES `CreditReport`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
