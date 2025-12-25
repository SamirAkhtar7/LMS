export type Gender = "MALE" | "FEMALE" | "OTHER";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
export type Relationship =
  | "FATHER"
  | "MOTHER"
  | "SPOUSE"
  | "SIBLING"
  | "FRIEND"
  | "OTHER";
export type WorkLocation = "OFFICE" | "REMOTE" | "HYBRID";

export interface CreateEmployee {
  fullName: string;
  email: string;
  password: string;
  role: "EMPLOYEE";
  contactNumber?: string;
  isActive?: boolean;

  // Optional employee-specific fields
  userName: string;
  mobileNumber: string;
  atlMobileNumber: string;
  dob: string | Date;
  designation?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;

  // Contact & address
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;

  // Emergency
  emergencyContact: string;
  emergencyRelationship?: Relationship;

  // Professional
  department?: string;
  dateOfJoining?: string | Date;
  experience?: string;
  reportingManagerId?: string;
  workLocation?: WorkLocation;
  salary?: number;
}
