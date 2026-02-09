/*
  Warnings:

  - Added the required column `branchId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `auditlog` ADD COLUMN `branchId` VARCHAR(191) NOT NULL,
    ADD COLUMN `newValue` JSON NULL,
    ADD COLUMN `oldValue` JSON NULL;

-- CreateIndex
CREATE INDEX `AuditLog_performedBy_idx` ON `AuditLog`(`performedBy`);

-- CreateIndex
CREATE INDEX `AuditLog_branchId_idx` ON `AuditLog`(`branchId`);
