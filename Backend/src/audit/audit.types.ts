export type AuditAction =
  | "CREATE_LOAN"
  | "CREATE_EMPLOYEE"
  | "UPDATE_EMPLOYEE"
  | "DELETE_EMPLOYEE"
  | "UPDATE_LOAN_STATUS"
  | "APPROVE_LOAN"
  | "REJECT_LOAN"
  | "VERIFY_DOCUMENT"
  | "REJECT_DOCUMENT"
  | "REFRESH_CREDIT_REPORT"
  | "ASSIGN_LOAN"
  | "UNASSIGN_LOAN"
  | "UPDATE_RECOVERY_STAGE"
  | "PAY_RECOVERY_AMOUNT"
  | "CREATE_LEGAL_REPORT"
  | "APPROVE_LEGAL_REPORT"
  | "CREATE_TECHNICAL_REPORT"
  | "APPROVE_TECHNICAL_REPORT"
  | "CREATE_BRANCH"
  | "UPDATE_BRANCH"
  | "DELETE_BRANCH"
  | "MANUAL_REFRESH_CREDIT_REPORT"
  | "GENERATE_EMI_SCHEDULE"
  | "CREATE_BRANCH_ADMIN"
  | "UPDATE_BRANCH_ADMIN"
  | "MANUAL_REFRESH";
  

export type AuditEntityType =
  | "LOAN"
  | "EMPLOYEE"
  | "BRANCH_ADMIN"
  | "DOCUMENT"
  | "CREDIT_REPORT"
  | "RECOVERY"
  | "KYC"
  | "LEGAL_REPORT"
  | "TECHNICAL_REPORT"
  | "BRANCH"
  | "EMI_SCHEDULE";
  

export interface CreateAuditLogInput {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  branchId: string;
  oldValue?: any;
  newValue?: any;
  remarks?: string;
}
    