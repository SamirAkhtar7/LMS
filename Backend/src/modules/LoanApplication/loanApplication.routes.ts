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
loanApplicationRouter.get("/", getAllLoanApplicationsController);
loanApplicationRouter.get("/:id", getLoanApplicationByIdController);
loanApplicationRouter.put(
  "/:id/status",
  validate(updateLoanApplicationSchema, "body"),
  validate(loanApplicationIdParamSchema, "params"),
  updateLoanApplicationStatusController
);

loanApplicationRouter.put(
  "/:id/review",
  //  checkPermissionMiddleware("REVIEW_LOAN"),
  reviewLoanController
);

loanApplicationRouter.put(
  "/:id/approve",
  //checkPermissionMiddleware("APPROVE_LOAN"),
  approveLoanController
);

loanApplicationRouter.put(
  "/:id/reject",
 // checkPermissionMiddleware("REJECT_LOAN"),
  rejectLoanController
);



export default loanApplicationRouter;
