import { Router, Request, Response } from "express";
import userRoutes from "./modules/user/userRoutes/user.routes.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { employeeRouter } from "./modules/employee/employee.routes.js";
import partnerRouter from "./modules/partner/partner.routes.js";
import { leadRouter } from "./modules/lead/lead.routes.js";
import loanApplicationRouter from "./modules/LoanApplication/loanApplication.routes.js";
import permissionRouter from "./modules/permission/permission.routes.js";
import kycRouter from "./modules/kyc/kyc.routes.js";
import emiRouter from "./modules/Emi/emi.router.js";
import loanTypeRouter from "./modules/loanTypes/loanTypes.routes.js";
import jobsRouter from "./jobs/jobs.routes.js";
import recoveryRouter from "./modules/recovery/recovery.routes.js";
import loanSettlementRouter from "./modules/settlement/loanSettlement.routes.js";
import loanDefaultRouter from "./modules/loanDefault/loanDefault.route.js";
import eligibilityRouter from "./modules/loanRuleEngine/ruleEngine.routes.js";
import creditReportRouter from "./modules/creditReport/creditReport.router.js";
import technicalReportRouter from "./modules/reports/technicalReport/technical.routes.js";
import legalReportRouter from "./modules/reports/legalReport/legal.routes.js";

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
router.use("/kyc", kycRouter);
router.use("/jobs", jobsRouter);
router.use("/emi", emiRouter);
router.use("/loantypes", loanTypeRouter);
router.use("/recovery", recoveryRouter);
router.use("/settlement", loanSettlementRouter);
router.use("/risk", eligibilityRouter);
router.use("/loan-default", loanDefaultRouter);
router.use("/credit", creditReportRouter);
router.use("/reports/technical", technicalReportRouter);
router.use("/reports/legal", legalReportRouter);

export default router;
