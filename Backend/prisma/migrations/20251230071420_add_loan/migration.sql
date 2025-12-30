/*
  Warnings:

  - You are about to drop the column `loanProductId` on the `loanapplication` table. All the data in the column will be lost.
  - You are about to drop the `customerkyc` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loanapproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loancharge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loandisbursement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loandocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loanemischedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loannachmandate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loanpayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loanproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `loanstatushistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `customerkyc` DROP FOREIGN KEY `CustomerKYC_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `loanapplication` DROP FOREIGN KEY `LoanApplication_loanProductId_fkey`;

-- DropForeignKey
ALTER TABLE `loanapproval` DROP FOREIGN KEY `LoanApproval_loanApplicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loancharge` DROP FOREIGN KEY `LoanCharge_loanApplicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loandisbursement` DROP FOREIGN KEY `LoanDisbursement_loanApplicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loandocument` DROP FOREIGN KEY `LoanDocument_loanApplicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loanemischedule` DROP FOREIGN KEY `LoanEmiSchedule_loanApplicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loannachmandate` DROP FOREIGN KEY `LoanNachMandate_loanApplicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loanpayment` DROP FOREIGN KEY `LoanPayment_emiId_fkey`;

-- DropForeignKey
ALTER TABLE `loanpayment` DROP FOREIGN KEY `LoanPayment_loanApplicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loanstatushistory` DROP FOREIGN KEY `LoanStatusHistory_loanApplicationId_fkey`;

-- DropIndex
DROP INDEX `LoanApplication_loanProductId_fkey` ON `loanapplication`;

-- AlterTable
ALTER TABLE `loanapplication` DROP COLUMN `loanProductId`;

-- DropTable
DROP TABLE `customerkyc`;

-- DropTable
DROP TABLE `loanapproval`;

-- DropTable
DROP TABLE `loancharge`;

-- DropTable
DROP TABLE `loandisbursement`;

-- DropTable
DROP TABLE `loandocument`;

-- DropTable
DROP TABLE `loanemischedule`;

-- DropTable
DROP TABLE `loannachmandate`;

-- DropTable
DROP TABLE `loanpayment`;

-- DropTable
DROP TABLE `loanproduct`;

-- DropTable
DROP TABLE `loanstatushistory`;
