/*
  Warnings:

  - You are about to drop the column `userName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `partner` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `partner` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[partnerId]` on the table `Partner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userName]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `commisionType` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPerson` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `partnerId` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentCycle` to the `Partner` table without a default value. This is not possible if the table is not empty.
  - Made the column `partnerType` on table `partner` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Employee_userName_key` ON `employee`;

-- DropIndex
DROP INDEX `Partner_userName_key` ON `partner`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `userName`;

-- AlterTable
ALTER TABLE `partner` DROP COLUMN `experience`,
    DROP COLUMN `userName`,
    ADD COLUMN `BusinessCategory` VARCHAR(191) NULL,
    ADD COLUMN `alternateNumber` VARCHAR(191) NULL,
    ADD COLUMN `annualTurnover` DOUBLE NULL,
    ADD COLUMN `businessNature` VARCHAR(191) NULL,
    ADD COLUMN `businessRegistrationNumber` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `commisionType` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    ADD COLUMN `commissionValue` DOUBLE NULL,
    ADD COLUMN `companyName` VARCHAR(191) NOT NULL,
    ADD COLUMN `contactPerson` VARCHAR(191) NOT NULL,
    ADD COLUMN `degination` VARCHAR(191) NULL,
    ADD COLUMN `establishedYear` INTEGER NULL,
    ADD COLUMN `fullAddress` VARCHAR(191) NULL,
    ADD COLUMN `minimumPayout` DOUBLE NULL,
    ADD COLUMN `partnerId` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentCycle` ENUM('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'PER_TRANSACTION') NOT NULL,
    ADD COLUMN `pinCode` VARCHAR(191) NULL,
    ADD COLUMN `specialization` VARCHAR(191) NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    ADD COLUMN `taxDeduction` DOUBLE NULL,
    ADD COLUMN `totalEmployees` INTEGER NULL,
    ADD COLUMN `website` VARCHAR(191) NULL,
    MODIFY `partnerType` ENUM('INDIVIDUAL', 'COMPANY', 'INSTITUTION', 'CORPARATE', 'AGENCY') NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `userName` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Partner_partnerId_key` ON `Partner`(`partnerId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_userName_key` ON `User`(`userName`);
