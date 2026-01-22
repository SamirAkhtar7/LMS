export type PartnerType =
  | "INDIVIDUAL"
  | "COMPANY"
  | "INSTITUTION"
  | "CORPORATE"
  | "AGENCY";
export type CommissionType = "FIXED" | "PERCENTAGE";

export type PaymentCycle =
  | "MONTHLY"
  | "QUARTERLY"
  | "HALF_YEARLY"
  | "YEARLY"
  | "PER_TRANSACTION";

export interface CreatePartner {
  // user fields
  fullName: string;
  email: string;
  password: string;
  role?: "PARTNER";
  userName: string;

  // contact
  address?: string;
  contactNumber?: string;
  alternateNumber?: string;

  isActive?: boolean;

  // partner-specific
  companyName?: string;
  contactPerson?: string;
  website?: string;
  establishedYear?: number;
  partnerType: PartnerType;
  businessNature?: string;

  // business details
  fullAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;

  designation?: string;
  businessCategory?: string;
  specialization?: string;
  totalEmployees?: number;
  annualTurnover?: number;
  businessRegistrationNumber?: string;

  // commission & payouts
  commissionType?: CommissionType;
  commissionValue?: number;
  paymentCycle?: PaymentCycle;
  minimumPayout?: number;
  taxDeduction?: number;

  targetArea?: string;
}

export interface UpdatePartner
  extends Omit<Partial<CreatePartner>, "password"> {
  totalReferrals?: number;
  activeReferrals?: number;
  commissionEarned?: number;
}

export interface PartnerModel {
  id: string;
  userId: string;
  userName?: string | null;
  partnerId?: string | null;
  companyName?: string | null;
  contactPerson?: string | null;
  alternateNumber?: string | null;
  website?: string | null;
  establishedYear?: number | null;
  partnerType?: PartnerType | null;
  businessNature?: string | null;
  fullAddress?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  designation?: string | null;
  businessCategory?: string | null;
  specialization?: string | null;
  totalEmployees?: number | null;
  annualTurnover?: number | null;
  businessRegistrationNumber?: string | null;
  commissionType?: CommissionType | null;
  paymentCycle?: PaymentCycle | null;
  minimumPayout?: number | null;
  taxDeduction?: number | null;
  targetArea?: string | null;
  totalReferrals?: number | null;
  activeReferrals?: number | null;
  commissionEarned?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
