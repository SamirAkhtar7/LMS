-- AlterTable
ALTER TABLE `loanemischedule` ADD COLUMN `isDeferred` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `EmiMoratorium` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `type` ENUM('FULL', 'INTEREST_ONLY') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `interestAccrued` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('active', 'completed') NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `LoanEmiSchedule_dueDate_status_idx` ON `LoanEmiSchedule`(`dueDate`, `status`);
