/*
  Warnings:

  - Added the required column `branchId` to the `SLABreachLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `slabreachlog` ADD COLUMN `branchId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `SLABreachLog_entityType_entityId_idx` ON `SLABreachLog`(`entityType`, `entityId`);

-- CreateIndex
CREATE INDEX `SLABreachLog_branchId_idx` ON `SLABreachLog`(`branchId`);
