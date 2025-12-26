/*
  Warnings:

  - You are about to drop the column `typeOfLoan` on the `leads` table. All the data in the column will be lost.
  - Added the required column `loanType` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leads` DROP COLUMN `typeOfLoan`,
    ADD COLUMN `loanType` ENUM('PERSONAL_LOAN', 'VEHICLE_LOAN', 'HOME_LOAN', 'EDUCATION_LOAN', 'BUSINESS_LOAN', 'GOLD_LOAN') NOT NULL;
