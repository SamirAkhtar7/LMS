export interface CreateUser {
  fullName: string;
  email: string;
  password: string;
  userName: string;
  role: "ADMIN" | "EMPLOYEE" | "PARTNER";
  address: string;
  contactNumber: string;
  branchId: string;
  isActive?: boolean;
}
