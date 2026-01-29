export const PERMISSIONS = [
  // Credit & Risk
  "REFRESH_CREDIT_REPORT",
  "CHECK_ELIGIBILITY",

  // Documents
  "UPLOAD_DOCUMENTS",
  "VERIFY_DOCUMENTS",

  // EMI
  "VIEW_EMIS",
  "GENERATE_EMI_SCHEDULE",
  "GENERATE_EMI_AMOUNT",
  "VIEW_EMI_PAYABLE_AMOUNT",
  "EMI_PAID",

  // Loan lifecycle
  "CREATE_LOAN_APPLICATION",
  "VIEW_LOAN_APPLICATIONS",
  "VIEW_LOAN_APPLICATION",
  "UPDATE_LOAN_STATUS",
  "REVIEW_LOAN",
  "APPROVE_LOAN",
  "REJECT_LOAN",

  // Defaults & Recoveries
  "CHECK_LOAN_DEFAULT",
  "VIEW_DEFAULTED_LOANS",
  "VIEW_LOAN_RECOVERIES",
  "VIEW_LOAN_RECOVERY_DETAILS",
  "PAY_RECOVERY_AMOUNT",
  "ASSIGN_RECOVERY_AGENT",
  "UPDATE_RECOVERY_STAGE",

  // Foreclosure & Moratorium
  "VIEW_FORECLOSE_AMOUNT",
  "FORECLOSE_LOAN",
  "APPLY_MORATORIUM",

  // Leads
  "View_All_Leads",
  "View_Lead_Details",
  "Update_Lead_Status",
  "Assign_Lead",
  "Convert_Lead_To_Loan",

  // Employees
  "Create_Employee",
  "View_All_Employees",
  "View_Employee_Details",
  "Update_Employee",

  // Partners
  "Create_Partner",
  "View_All_Partners",
  "View_Partner_Details",
  "Update_Partner",

  // Loan Types
  "create_loan_type",
  "view_loan_types",
  "view_loan_type",
  "update_loan_type",
  "delete_loan_type",

  // Legal & Technical
  "CREATE_LEGAL_REPORT",
  "APPROVE_LEGAL_REPORT",
  "VIEW_LEGAL_REPORTS",
  "CREATE_TECHNICAL_REPORT",
  "APPROVE_TECHNICAL_REPORT",
  "VIEW_TECHNICAL_REPORTS",

  // Settlement
  "SETTLE_LOAN",
  "APPLY_SETTLEMENT",
  "APPROVE_SETTLEMENT",
  "PAY_SETTLEMENT",
  "REJECT_SETTLEMENT",
  "VIEW_SETTLEMENT_PAYABLE_AMOUNT",
  "VIEW_SETTLEMENTS",
  "VIEW_SETTLEMENT_DASHBOARD",

  // Permissions
  "Create_Permissions",
  "Assign_Permissions",
  "View_User_Permissions",
  "View_All_Permissions",
] as const;
