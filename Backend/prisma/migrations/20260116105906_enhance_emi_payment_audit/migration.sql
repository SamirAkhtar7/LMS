/*
  Warnings:

  - The values [upi,nach,net_banking,cash,cheque] on the enum `EmiPayment_paymentMode` will be removed. If these variants are still used in the database, this will fail.
  - The values [upi,nach,net_banking,cash,cheque] on the enum `EmiPayment_paymentMode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `emipayment` MODIFY `paymentMode` ENUM('CASH', 'UPI', 'BANK', 'CHEQUE') NOT NULL;

-- AlterTable
ALTER TABLE `loanemischedule` ADD COLUMN `chequeStatus` ENUM('PENDING', 'CLEARED', 'BOUNCED') NULL,
    ADD COLUMN `lastPaymentDate` DATETIME(3) NULL,
    ADD COLUMN `lastPaymentMode` ENUM('CASH', 'UPI', 'BANK', 'CHEQUE') NULL;

-- AlterTable
ALTER TABLE `recoverypayments` MODIFY `paymentMode` ENUM('CASH', 'UPI', 'BANK', 'CHEQUE') NOT NULL;
