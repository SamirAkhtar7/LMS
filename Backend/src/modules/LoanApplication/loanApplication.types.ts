export type InterestType = "flat" | "reducing";
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

export interface LoanProductModel {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  interestRate?: number | null;
  category?: string | null; // LoanCategory
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanDocumentModel {
  id: string;
  loanApplicationId: string;
  documentType: string;
  documentPath: string;
  verificationStatus: string; // VerificationStatus
  createdAt: Date;
}

export interface LoanApprovalModel {
  id: string;
  loanApplicationId: string;
  approvalLevel: string; // ApprovalLevel
  approvedAmount: number;
  approvedInterest: number;
  remarks?: string | null;
  approvedAt: Date;
}

export interface LoanDisbursementModel {
  id: string;
  loanApplicationId: string;
  disbursedAmount: string; // Decimal stored as string at runtime from Prisma
  bankAccount: string;
  ifscCode: string;
  transactionRef: string;
  disbursedAt: Date;
}

export interface LoanEmiScheduleModel {
  id: string;
  loanApplicationId: string;
  emiNo: number;
  dueDate: Date;
  principalAmount: string;
  openingBalance: string;
  interestAmount: string;
  emiAmount: string;
  closingBalance: string;
  status: string; // EmiStatus
  paidDate?: Date | null;
}

export interface LoanPaymentModel {
  id: string;
  loanApplicationId: string;
  emiId?: string | null;
  paymentAmount: string;
  paymentMode: string; // PaymentMode
  transactionRef: string;
  paymentDate: Date;
}

export interface LoanNachMandateModel {
  id: string;
  loanApplicationId: string;
  mandateReference: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  status: string; // VerificationStatus
  registeredAt: Date;
}

export interface LoanChargeModel {
  id: string;
  loanApplicationId: string;
  chargeType: string; // ChargeType
  chargeAmount: string;
  chargeDate: Date;
  status: string;
}

export interface LoanStatusHistoryModel {
  id: string;
  loanApplicationId: string;
  oldStatus: LoanStatus;
  newStatus: LoanStatus;
  remarks?: string | null;
  changedAt: Date;
}

export interface CreateLoanApplication {
  // Existing customer reference or inline customer data
  customerId?: string;

  // Inline customer fields (optional when providing customerId)
  title?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: string;
  dob?: string | Date;
  aadhaarNumber?: string;
  panNumber?: string;
  voterId?: string;
  passportNumber?: string;
  contactNumber?: string;
  alternateNumber?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  employmentType?: string;
  monthlyIncome?: number;
  annualIncome?: number;
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  status?: string;

  // Top-level identifiers (alternative lookup keys)
  // (panNumber/aadhaarNumber/contactNumber may be provided either here or above)
  // panNumber?: string;
  // aadhaarNumber?: string;
  // contactNumber?: string;

  // Loan-specific fields
  loanProductId?: string;
  requestedAmount?: number;
  tenureMonths?: number;
  interestRate?: number;
  interestType?: InterestType;
  emiAmount?: number;
  totalPayable?: number;
  loanPurpose?: string;
  cibilScore?: number;
  approvedAmount?: number;
}

export interface UpdateLoanApplication extends Partial<CreateLoanApplication> {
  status?: LoanStatus;
  approvedAmount?: number;
  approvalDate?: Date | null;
  activationDate?: Date | null;
  rejectionReason?: string | null;
}

export interface LoanApplicationModel {
  id: string;
  //   leadId: string;
  applicationDate: Date;
  customerId: string;
  product?: LoanProductModel | null;
  requestedAmount: number;
  approvedAmount?: number | null;
  tenureMonths?: number | null;
  interestRate?: number | null;
  interestType: InterestType;
  emiAmount?: number | null;
  totalPayable?: number | null;
  loanPurpose?: string | null;
  cibilScore?: number | null;
  status: LoanStatus;
  approvalDate?: Date | null;
  activationDate?: Date | null;
  rejectionReason?: string | null;
  documents?: LoanDocumentModel[];
  approvals?: LoanApprovalModel[];
  disbursements?: LoanDisbursementModel[];
  emis?: LoanEmiScheduleModel[];
  payments?: LoanPaymentModel[];
  charges?: LoanChargeModel[];
  statusHistory?: LoanStatusHistoryModel[];
  nachMandates?: LoanNachMandateModel[];
  createdAt: Date;
  updatedAt: Date;
}
