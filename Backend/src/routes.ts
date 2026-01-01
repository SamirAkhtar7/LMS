import { Router, Request, Response } from "express";
import userRoutes from "./modules/user/userRoutes/user.routes.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { employeeRouter } from "./modules/employee/employee.routes.js";
import partnerRouter from "./modules/partner/partner.routes.js";
import { leadRouter } from "./modules/lead/lead.routes.js";
import loanApplicationRouter from "./modules/LoanApplication/loanApplication.routes.js";
import permissionRouter from "./modules/permission/permission.routes.js";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the LMS Backend!");
});
router.use("/user", userRoutes);
router.use("/auth", authRouter);
router.use("/employee", employeeRouter);
router.use("/partner", partnerRouter);
router.use("/lead", leadRouter);
router.use("/loan-applications", loanApplicationRouter);
router.use("/permissions", permissionRouter);

export default router;
