import { authMiddleware } from "../common/middlewares/auth.middleware.js";
import { processOverdueEmisController } from "../jobs/jobs.controller.js";
import { Router } from "express";
import { adminMiddleware } from "../common/middlewares/adminMiddleware.js";
const jobsRouter = Router();

jobsRouter.post(
    "/emis/process-overdue",
    authMiddleware,
    adminMiddleware,
  processOverdueEmisController
);

export default jobsRouter;