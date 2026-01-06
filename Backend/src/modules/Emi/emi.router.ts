import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

import {
  generateEmiScheduleController,
  getLoanEmiController,
  markEmiPaidController,
} from "./emi.controller.js";

const emiRouter = Router();

// Example route to generate EMI schedule

emiRouter.post(
  "/loan-applications/:id/emis",
  authMiddleware,
  generateEmiScheduleController
);

emiRouter.get(
  "/loan-applications/:id/emis",
  authMiddleware,
  getLoanEmiController
);

emiRouter.post("/emis/:emiId/pay", authMiddleware, markEmiPaidController);

export default emiRouter;
