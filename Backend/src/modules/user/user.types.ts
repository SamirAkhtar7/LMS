export interface CreateUser {
  fullName: string;
  email: string;
  password: string;
  role: "ADMIN" | "EMPLOYEE" | "PARTNER";
  address: string;
  contactNumber: string;
  isActive?: boolean;
}
