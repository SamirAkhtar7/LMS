import { Router } from "express";
import {
  getRecoveryByLoanIdController,
  payRecoveryAmountController,
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
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";



const recoveryRouter = Router();


recoveryRouter.get(
  "/loan-applications/:loanId/recoveries",
  authMiddleware,
  checkPermissionMiddleware("VIEW_LOAN_RECOVERIES"),
  getRecoveryByLoanIdController
);

recoveryRouter.post(
  "/recoveries/:recoveryId/pay",
  authMiddleware,
  checkPermissionMiddleware("PAY_RECOVERY_AMOUNT"),
  validate(recoveryPaymentSchema),
  payRecoveryAmountController
);

recoveryRouter.post(
  "/recoveries/:recoveryId/assign",
  authMiddleware,
  checkPermissionMiddleware("ASSIGN_RECOVERY_AGENT"),
  validate(assignRecoverySchema),
  assignRecoveryAgentController
);

recoveryRouter.put(
  "/recoveries/:recoveryId/stage",
  authMiddleware,
  checkPermissionMiddleware("UPDATE_RECOVERY_STAGE"),
  validate(updateRecoveryStageSchema),
  updateRecoveryStageController
);

recoveryRouter.get(
  "/loan-applications/:loanId/recovery-details",
  authMiddleware,
  checkPermissionMiddleware("VIEW_LOAN_RECOVERY_DETAILS"),
  getLoanWithRecoveryController
);
recoveryRouter.get(
  "/recoveries",
  authMiddleware,
  checkPermissionMiddleware("VIEW_ALL_RECOVERIES"),
    getAllRecoveriesController
);

recoveryRouter.get(
    "/recoveries/:recoveryId",
  authMiddleware,
  checkPermissionMiddleware("VIEW_RECOVERY_DETAILS"),
    getRecoveryDetailsController
);
recoveryRouter.get(
    "/agents/:agentId/recoveries",
  authMiddleware,
  checkPermissionMiddleware("VIEW_AGENT_RECOVERIES"),
    getRecoveryByAgentController
);

recoveryRouter.get(
  "/dashboard",
  authMiddleware,
  checkPermissionMiddleware("VIEW_RECOVERY_DASHBOARD"),
  getRecoveryDashboardController
);

export default recoveryRouter;
