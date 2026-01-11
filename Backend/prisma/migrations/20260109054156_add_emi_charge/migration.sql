-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `bounceCharges` DOUBLE NULL,
    ADD COLUMN `emiPaymentAmount` DOUBLE NULL,
    ADD COLUMN `emiStartDate` DATETIME(3) NULL,
    ADD COLUMN `latePaymentFee` DOUBLE NULL,
    ADD COLUMN `latePaymentFeeType` ENUM('FIXED', 'PERCENTAGE') NULL;

-- AlterTable
ALTER TABLE `loantype` ADD COLUMN `bounceCharges` DOUBLE NULL,
    ADD COLUMN `latePaymentFee` DOUBLE NULL,
    ADD COLUMN `latePaymentFeeType` ENUM('FIXED', 'PERCENTAGE') NULL;
