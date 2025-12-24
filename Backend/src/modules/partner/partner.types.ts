export interface CreatePartner {
  fullName: string;
  email: string;
  password: string;
  role: "PARTNER";
  address: string;
  phone: string;
  isActive?: boolean;

  // partner-specific
  partnerType?: string;
  experience?: string;
  targetArea?: string;
}

export interface UpdatePartner
  extends Omit<Partial<CreatePartner>, "password" | "role"> {
  totalReferrals?: number;
  activeReferrals?: number;
  commissionEarned?: number;
}

export interface PartnerModel {
  id: string;
  userId: string;
  partnerType?: string | null;
  experience?: string | null;
  targetArea?: string | null;
  totalReferrals?: number | null;
  activeReferrals?: number | null;
  commissionEarned?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
