export interface CreateEmployee {
  fullName: string;
  email: string;
  password: string;
  role:  "EMPLOYEE";
  address: string;
  phone: string;
  isActive?: boolean;
}
