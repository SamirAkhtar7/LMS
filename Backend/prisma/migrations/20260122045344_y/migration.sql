/*
  Warnings:

  - A unique constraint covering the columns `[leadNumber]` on the table `Leads` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `leadNumber` to the `Leads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leads` ADD COLUMN `leadNumber` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Leads_leadNumber_key` ON `Leads`(`leadNumber`);

-- CreateIndex
CREATE INDEX `Leads_leadNumber_idx` ON `Leads`(`leadNumber`);
