import { Router } from "express";

import { 
    assignLoanController,
    unassignLoanController,
    getMyAssignedLoansController
} from "./loanAssignment.controller.js";
 

import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { assignLoanSchema, unassignLoanSchema } from "./loanAssignment.schema.js";


const loanAssignmentRouter = Router();


loanAssignmentRouter.post(
  "/loans/:loanApplicationId/assign",
  authMiddleware,
  checkPermissionMiddleware("ASSIGN_LOAN"),
  validate(assignLoanSchema),
  assignLoanController,
);

loanAssignmentRouter.post(
    "/loans/unassign/:assignmentId",
    authMiddleware,
    checkPermissionMiddleware("UNASSIGN_LOAN"),
    validate(unassignLoanSchema, "params"),
    unassignLoanController
)

loanAssignmentRouter.get(
    "/my-assigned-loans",
    authMiddleware,
    // checkPermissionMiddleware("VIEW_ASSIGNED_LOANS"),
    getMyAssignedLoansController
)

export default loanAssignmentRouter;
