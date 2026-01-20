-- AlterTable
ALTER TABLE `loanrecovery` ADD COLUMN `settlementAmount` DOUBLE NULL,
    ADD COLUMN `settlementApprovedBy` VARCHAR(191) NULL,
    ADD COLUMN `settlementDate` DATETIME(3) NULL,
    MODIFY `recoveryStage` ENUM('INITIAL_CONTACT', 'FIELD_VISIT', 'NEGOTIATION', 'LEGAL_ACTION', 'SETTLEMENT', 'CLOSED') NOT NULL,
    MODIFY `recoveryStatus` ENUM('ONGOING', 'IN_PROGRESS', 'RESOLVED', 'WRITE_OFF', 'SETTLED', 'COMPLETED') NOT NULL;

-- AddForeignKey
ALTER TABLE `LoanRecovery` ADD CONSTRAINT `LoanRecovery_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
