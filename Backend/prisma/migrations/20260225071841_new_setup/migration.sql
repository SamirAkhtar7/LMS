/*
  Warnings:

  - You are about to drop the column `StartDate` on the `nachmandate` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `NachMandate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `nachmandate` DROP COLUMN `StartDate`,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL;
