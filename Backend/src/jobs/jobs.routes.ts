import { authMiddleware } from "../common/middlewares/auth.middleware.js";
import { processOverdueEmisController ,runLoanDefaultCron } from "../jobs/jobs.controller.js";
import { Router } from "express";
import { adminMiddleware } from "../common/middlewares/adminMiddleware.js";
const jobsRouter = Router();

jobsRouter.post(
    "/emis/process-overdue",
    authMiddleware,
    adminMiddleware,
  processOverdueEmisController
);

jobsRouter.get(
  "/loan-default-cron",
  authMiddleware,
  adminMiddleware,
  runLoanDefaultCron
);

export default jobsRouter;