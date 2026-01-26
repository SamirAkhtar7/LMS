-- AlterTable
ALTER TABLE `loanapplication` MODIFY `status` ENUM('draft', 'submitted', 'kyc_pending', 'credit_check', 'under_review', 'LEGAL_PENDING', 'TECHNICAL_PENDING', 'LEGAL_APPROVED', 'TECHNICAL_APPROVED', 'approved', 'rejected', 'disbursed', 'active', 'closed', 'delinquent', 'written_off', 'defaulted', 'application_in_progress') NOT NULL DEFAULT 'application_in_progress';
