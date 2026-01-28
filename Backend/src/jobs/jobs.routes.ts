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
  async (req, res) => {
    try {
      const result = await runLoanDefaultCron();
      res.json(result); // ✅ Send response back to Postman
    } catch (err) {
      console.error("Error running loan default cron:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default jobsRouter;