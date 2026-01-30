-- CreateTable
CREATE TABLE `LoanAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `loanApplicationId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `role` ENUM('PROCESSOR', 'LEGAL', 'TECHNICAL', 'RECOVERY') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `assignedBy` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unassignedAt` DATETIME(3) NULL,

    INDEX `LoanAssignment_loanApplicationId_employeeId_idx`(`loanApplicationId`, `employeeId`),
    UNIQUE INDEX `LoanAssignment_loanApplicationId_employeeId_role_key`(`loanApplicationId`, `employeeId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LoanAssignment` ADD CONSTRAINT `LoanAssignment_loanApplicationId_fkey` FOREIGN KEY (`loanApplicationId`) REFERENCES `LoanApplication`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoanAssignment` ADD CONSTRAINT `LoanAssignment_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
