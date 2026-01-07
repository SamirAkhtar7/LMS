/*
  Warnings:

  - You are about to drop the column `employmentTypes` on the `loantype` table. All the data in the column will be lost.
  - You are about to drop the column `gestPercentage` on the `loantype` table. All the data in the column will be lost.
  - You are about to drop the column `miniCibilScore` on the `loantype` table. All the data in the column will be lost.
  - You are about to drop the column `perpaymentCharges` on the `loantype` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `loantype` DROP COLUMN `employmentTypes`,
    DROP COLUMN `gestPercentage`,
    DROP COLUMN `miniCibilScore`,
    DROP COLUMN `perpaymentCharges`,
    ADD COLUMN `employmentType` ENUM('salaried', 'self_employed', 'business') NULL,
    ADD COLUMN `gstPercentage` DOUBLE NULL,
    ADD COLUMN `minCibilScore` INTEGER NULL,
    ADD COLUMN `prepaymentCharges` DOUBLE NULL;
