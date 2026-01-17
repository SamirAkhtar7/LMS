/*
  Warnings:

  - A unique constraint covering the columns `[loanApplicationId,documentType]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[loanNumber]` on the table `LoanApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `loanNumber` to the `LoanApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `loanapplication` ADD COLUMN `loanNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Document_loanApplicationId_documentType_key` ON `Document`(`loanApplicationId`, `documentType`);

-- CreateIndex
CREATE UNIQUE INDEX `LoanApplication_loanNumber_key` ON `LoanApplication`(`loanNumber`);

-- CreateIndex
CREATE INDEX `LoanApplication_loanNumber_idx` ON `LoanApplication`(`loanNumber`);
