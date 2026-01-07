export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface CreateLead {
  fullName: string;
  contactNumber: string;
  email: string;
  dob: string | Date;
  gender: Gender;
  loanAmount: number;
  loanTypeId: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;

  // optional assignment fields
  assignedTo?: string | null;
  assignedBy?: string | null;

  // optional override
  status?: string;
}

export interface UpdateLead extends Partial<CreateLead> {
  // allow partial updates; keep id for reference where needed
}

export interface LeadModel {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  dob: Date;
  gender: Gender;
  loanAmount: number;
  loanTypeId: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  assignedTo?: string | null;
  assignedBy?: string | null;
  status?: string;
}
