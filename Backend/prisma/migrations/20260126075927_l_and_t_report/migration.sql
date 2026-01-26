-- CreateTable
CREATE TABLE `TechnicalReport` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `engineerId` VARCHAR(191) NULL,
    `engineerName` VARCHAR(191) NOT NULL,
    `agencyName` VARCHAR(191) NULL,
    `propertyType` VARCHAR(191) NOT NULL,
    `propertyAddress` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `marketValue` DOUBLE NOT NULL,
    `discussionValue` DOUBLE NOT NULL,
    `forcesdSaleValue` DOUBLE NULL,
    `recommendedLtv` DOUBLE NOT NULL,
    `constructionStatus` VARCHAR(191) NOT NULL,
    `propertyAge` INTEGER NULL,
    `residualLife` INTEGER NULL,
    `qualityOfConstruction` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED') NOT NULL DEFAULT 'PENDING',
    `remarks` VARCHAR(191) NULL,
    `reportUrl` VARCHAR(191) NULL,
    `sitePhotographs` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalReport` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `advocateId` VARCHAR(191) NULL,
    `advocateName` VARCHAR(191) NOT NULL,
    `lawFirmName` VARCHAR(191) NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `ownershipType` VARCHAR(191) NOT NULL,
    `titleClear` BOOLEAN NOT NULL,
    `titleChainYears` INTEGER NOT NULL,
    `encumbranceFound` BOOLEAN NOT NULL,
    `encumbranceDetails` VARCHAR(191) NULL,
    `reraRegistered` BOOLEAN NULL,
    `landUserClear` BOOLEAN NULL,
    `buildingApproval` BOOLEAN NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REWORK_REQUIRED') NOT NULL DEFAULT 'PENDING',
    `remarks` VARCHAR(191) NULL,
    `reportUrl` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NULL,
    `approvedBy` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LegalReport_loanApplicationId_idx`(`loanApplicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `performedBy` VARCHAR(191) NOT NULL,
    `remarks` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TechnicalReport` ADD CONSTRAINT `TechnicalReport_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LegalReport` ADD CONSTRAINT `LegalReport_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
