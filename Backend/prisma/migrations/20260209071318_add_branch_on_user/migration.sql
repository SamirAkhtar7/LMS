/*
  Warnings:

  - You are about to drop the column `mobileNumber` on the `employee` table. All the data in the column will be lost.
  - Made the column `branchId` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_branchId_fkey`;

-- DropIndex
DROP INDEX `User_branchId_fkey` ON `user`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `mobileNumber`;

-- AlterTable
ALTER TABLE `user` MODIFY `branchId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
