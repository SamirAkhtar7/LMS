/*
  Warnings:

  - You are about to alter the column `status` on the `leads` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.

*/
-- AlterTable
ALTER TABLE `leads` MODIFY `status` ENUM('CONTACTED', 'INTERESTED', 'APPLICATION_IN_PROGRESS', 'APPLICATION_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FUNDED', 'CLOSED', 'DROPPED', 'PENDING') NOT NULL DEFAULT 'PENDING';
