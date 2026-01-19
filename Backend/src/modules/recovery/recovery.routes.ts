import { Router } from "express";
import {
  getRecoveryByLoanIdController,
  payRecoveryAmountConstroller,
  assignRecoveryAgentController,
  updateRecoveryStageController,
  getLoanWithRecoveryController,
  getAllRecoveriesController,
  getRecoveryDetailsController,
  getRecoveryByAgentController,
  getRecoveryDashboardController,
} from "./recovery.controller.js";

import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

import { validate } from "../../common/middlewares/zod.middleware.js";
import {
  recoveryPaymentSchema,
  assignRecoverySchema,
  updateRecoveryStageSchema,
} from "./recovery.schema.js";


const recoveryRouter = Router();


recoveryRouter.get(
  "/loan-applications/:loanId/recoveries",
  authMiddleware,
  getRecoveryByLoanIdController
);

recoveryRouter.post(
  "/recoveries/:recoveryId/pay",
  authMiddleware,
  validate(recoveryPaymentSchema),
  payRecoveryAmountConstroller
);

recoveryRouter.post(
  "/recoveries/:recoveryId/assign",
  authMiddleware,
  validate(assignRecoverySchema),
  assignRecoveryAgentController
);

recoveryRouter.put(
  "/recoveries/:recoveryId/stage",
  authMiddleware,
  validate(updateRecoveryStageSchema),
  updateRecoveryStageController
);

recoveryRouter.get(
  "/loan-applications/:loanId/recovery-details",
  authMiddleware,
  getLoanWithRecoveryController
);
recoveryRouter.get(
  "/recoveries",
    authMiddleware,
    getAllRecoveriesController
);

recoveryRouter.get(
    "/recoveries/:recoveryId",
    authMiddleware,
    getRecoveryDetailsController
);
recoveryRouter.get(
    "/agents/:agentId/recoveries",
    authMiddleware,
    getRecoveryByAgentController
);

recoveryRouter.get(
  "/dashboard",
  authMiddleware,
  getRecoveryDashboardController
);

export default recoveryRouter;
