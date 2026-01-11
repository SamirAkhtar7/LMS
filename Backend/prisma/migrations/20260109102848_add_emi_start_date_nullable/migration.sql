-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `foreclosureAllowed` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `foreclosureCharges` DOUBLE NULL,
    ADD COLUMN `foreclosureChargesType` ENUM('FIXED', 'PERCENTAGE') NULL,
    ADD COLUMN `foreclosureDate` DATETIME(3) NULL,
    ADD COLUMN `prepaymentAllowed` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `prepaymentChargeType` ENUM('FIXED', 'PERCENTAGE') NULL,
    ADD COLUMN `prepaymentCharges` DOUBLE NULL,
    ADD COLUMN `prepaymentDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `loanemischedule` ADD COLUMN `bounceCharges` DOUBLE NULL,
    ADD COLUMN `emiPaymentAmount` DOUBLE NULL,
    ADD COLUMN `emiStartDate` DATETIME(3) NULL,
    ADD COLUMN `latePaymentFee` DOUBLE NULL,
    ADD COLUMN `latePaymentFeeType` ENUM('FIXED', 'PERCENTAGE') NULL;

-- CreateTable
CREATE TABLE `EmiPayment` (
    `id` VARCHAR(191) NOT NULL,
    `emiScheduleId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `paymentMode` ENUM('upi', 'nach', 'net_banking', 'cash', 'cheque') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `LoanEmiSchedule_loanApplicationId_emiNo_idx` ON `LoanEmiSchedule`(`loanApplicationId`, `emiNo`);
