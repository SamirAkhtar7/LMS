/*
  Warnings:

  - Made the column `bounceCharges` on table `loanemischedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latePaymentFee` on table `loanemischedule` required. This step will fail if there are existing NULL values in that column.
  - Made the column `latePaymentFeeType` on table `loanemischedule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `loanemischedule` MODIFY `bounceCharges` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `latePaymentFee` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `latePaymentFeeType` ENUM('FIXED', 'PERCENTAGE') NOT NULL DEFAULT 'FIXED';
