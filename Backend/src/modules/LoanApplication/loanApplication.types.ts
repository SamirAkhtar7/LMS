import type {
  EmploymentType as PrismaEmploymentType,
  EmiStatus as PrismaEmiStatus,
  CommissionType,
} from "../../../generated/prisma-client/enums.js";

export type InterestType = "FLAT" | "REDUCING";
export type LoanStatus =
  | "draft"
  | "submitted"
  | "kyc_pending"
  | "credit_check"
  | "under_review"
  | "approved"
  | "rejected"
  | "disbursed"
  | "active"
  | "closed"
  | "written_off"
  | "defaulted"
  | "application_in_progress";

// export interface LoanProductModel {
//   id: string;
//   name: string;
//   code?: string | null;
//   description?: string | null;
//   interestRate?: number | null;
//   category?: string | null; // LoanCategory
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface LoanDocumentModel {
//   id: string;
//   loanApplicationId: string;
//   documentType: string;
//   documentPath: string;
//   verificationStatus: string; // VerificationStatus
//   createdAt: Date;
// }

// export interface LoanApprovalModel {
//   id: string;
//   loanApplicationId: string;
//   approvalLevel: string; // ApprovalLevel
//   approvedAmount: number;
//   approvedInterest: number;
//   remarks?: string | null;
//   approvedAt: Date;
// }

// export interface LoanDisbursementModel {
//   id: string;
//   loanApplicationId: string;
//   disbursedAmount: string; // Decimal stored as string at runtime from Prisma
//   bankAccount: string;
//   ifscCode: string;
//   transactionRef: string;
//   disbursedAt: Date;
// }

// export interface LoanEmiScheduleModel {
//   id: string;
//   loanApplicationId: string;
//   emiNo: number;
//   dueDate: Date;
//   principalAmount: string;
//   openingBalance: string;
//   interestAmount: string;
//   emiAmount: string;
//   closingBalance: string;
//   status: string; // EmiStatus
//   paidDate?: Date | null;
// }

// export interface LoanPaymentModel {
//   id: string;
//   loanApplicationId: string;
//   emiId?: string | null;
//   paymentAmount: string;
//   paymentMode: string; // PaymentMode
//   transactionRef: string;
//   paymentDate: Date;
// }

// export interface LoanNachMandateModel {
//   id: string;
//   loanApplicationId: string;
//   mandateReference: string;
//   bankName: string;
//   accountNumber: string;
//   ifscCode: string;
//   status: string; // VerificationStatus
//   registeredAt: Date;
// }

// export interface LoanChargeModel {
//   id: string;
//   loanApplicationId: string;
//   chargeType: string; // ChargeType
//   chargeAmount: string;
//   chargeDate: Date;
//   status: string;
// }

// export interface LoanStatusHistoryModel {
//   id: string;
//   loanApplicationId: string;
//   oldStatus: LoanStatus;
//   newStatus: LoanStatus;
//   remarks?: string | null;
//   changedAt: Date;
// }

export type Title = "MR" | "MRS" | "MS" | "DR" | "PROF";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type EmploymentType = PrismaEmploymentType;
export type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";
export type CustomerKYCStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type ApprovalLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
export type EmiStatus = PrismaEmiStatus;
export type PaymentMode =
  | "CASH"
  | "CHEQUE"
  | "ONLINE_TRANSFER"
  | "NEFT"
  | "RTGS"
  | "IMPS";
export type MaritalStatus =
  | "SINGLE"
  | "MARRIED"
  | "DIVORCED"
  | "WIDOWED"
  | "OTHER";
export type Category = "GENERAL" | "SC" | "ST" | "OBC" | "OTHER";
export type LoanType =
  | "PERSONAL_LOAN"
  | "VEHICLE_LOAN"
  | "HOME_LOAN"
  | "EDUCATION_LOAN"
  | "BUSINESS_LOAN"
  | "GOLD_LOAN";

export interface CreateLoanApplication {
  // ----------------- Customer Fields -----------------
  title: Title;
  firstName: string;
  lastName?: string;
  middleName?: string;
  gender?: Gender;
  dob?: Date | string;

  aadhaarNumber?: string;
  panNumber?: string;
  voterId?: string;
  passportNumber?: string;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  category?: Category;
  spouseName?: string;

  contactNumber: string;
  alternateNumber?: string;
  email?: string;

  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;

  employmentType?: EmploymentType;
  monthlyIncome?: number;
  annualIncome?: number;

  // Bank / account
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  accountType?: string;
  otherIncome?: number;
  accountNumber?: string;

  // ----------------- Loan Fields -----------------
  loanProductId?: string;
  loanTypeId?: string;
  requestedAmount: number;

  tenureMonths?: number;
  interestRate?: number;
  interestType?: InterestType;

  emiAmount?: number;
  totalPayable?: number;
  purposeDetails?: string;
  loanPurpose?: string;
  cibilScore?: number;

  coApplicantAadhaarNumber?: string;
  coApplicantPanNumber?: string;
  coApplicantName?: string;
  coApplicantContactNumber?: string;

  approvedAmount?: number;
  status?: LoanStatus; // optional, default: application_in_progress
}

export interface EmiScheduleInput {
  loanId: string;
  emiStartDate: Date;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  emiAmount: number;
  startDate: Date;
}

export interface EmiScheduleItem {
  emiStartDate: Date;
  loanApplicationId: string;
  emiNo: number;
  dueDate: Date;
  openingBalance: number;
  interestAmount: number;
  principalAmount: number;
  emiAmount: number;
  closingBalance: number;
  status?: EmiStatus;
  paidDate?: Date | null;
}

export interface apperoveLoanInput {
  latePaymentFeeType: CommissionType;
  latePaymentFee: number;
  bounceCharges: number;
  prepaymentChargeType: CommissionType;
  prepaymentAllowed: boolean;
  prepaymentDate: Date;
  prepaymentCharges: number;
  foreclosureChargesType: CommissionType;
  foreclosureAllowed: boolean;
  foreclosureDate: Date;
  foreclosureCharges: number;
  // Added approval-related fields used by approveLoanService
  approvedAmount?: number;
  tenureMonths?: number;
  interestType?: InterestType;
  interestRate?: number;
  emiStartDate?: Date;
  emiPaymentAmount?: number;
  emiAmount?: number;
}
