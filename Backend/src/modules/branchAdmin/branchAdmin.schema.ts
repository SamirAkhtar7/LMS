import { z } from "zod";

export const createBranchAdminSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    branchId: z.string().min(1, "Branch ID is required"),
});