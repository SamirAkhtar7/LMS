import { Router } from "express";
const loanApplicationRouter = Router();
import {
  createLoanApplicationController,
  getAllLoanApplicationsController,
  getLoanApplicationByIdController,
  reviewLoanController,
  approveLoanController,
  rejectLoanController,
  updateLoanApplicationStatusController,
} from "./loanApplication.controller.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import {
  createLoanApplicationSchema,
  updateLoanApplicationSchema,
  loanApplicationIdParamSchema,
} from "./loanApplication.schema.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

// Define your loan application routes here
loanApplicationRouter.post(
  "/",
  authMiddleware,
  validate(createLoanApplicationSchema),
  createLoanApplicationController
);
loanApplicationRouter.get("/", authMiddleware, getAllLoanApplicationsController);
loanApplicationRouter.get(
  "/:id",
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
  getLoanApplicationByIdController
);
loanApplicationRouter.put(
  "/:id/status",
  authMiddleware,
  // checkPermissionMiddleware("UPDATE_LOAN_STATUS"),
  validate(updateLoanApplicationSchema, "body"),
  validate(loanApplicationIdParamSchema, "params"),
  updateLoanApplicationStatusController
);

loanApplicationRouter.put(
  "/:id/review",
  //  checkPermissionMiddleware("REVIEW_LOAN"),
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
  reviewLoanController
);

loanApplicationRouter.put(
  "/:id/approve",
  //checkPermissionMiddleware("APPROVE_LOAN"),
  approveLoanController
);

loanApplicationRouter.put(
  "/:id/reject",
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
 // checkPermissionMiddleware("REJECT_LOAN"),
  rejectLoanController
);



export default loanApplicationRouter;
