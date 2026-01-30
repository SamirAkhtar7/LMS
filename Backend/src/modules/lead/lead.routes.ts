import { Router } from "express";
import {
  createLeadSchema,
  updateLeadSchema,
  leadIdParamSchema,
  updateLeadStatusSchema,
  leadStatusParamSchema,
  leadAssigedSchema,
} from "./lead.schema.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import {
  assignLeadController,
  convertLeadToLoanController,
  createLeadController,
  getAllLeadsController,
  getLeadByIdController,
  updateLeadStatusController,
} from "./lead.controller.js";
export const leadRouter = Router();
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";

// Define lead routes here
leadRouter.post("/", validate(createLeadSchema), createLeadController);

leadRouter.use(authMiddleware);
leadRouter.get(
  "/all",
  checkPermissionMiddleware("View_All_Leads"),
  getAllLeadsController
);
leadRouter.get(
  "/:id",
  validate(leadIdParamSchema, "params"),
   checkPermissionMiddleware("View_Lead_Details"),
  getLeadByIdController
);

leadRouter.patch(
  "/update-status/:id",
  validate(updateLeadStatusSchema),
   checkPermissionMiddleware("UPDATE_LEAD_STATUS"),
  updateLeadStatusController
);

leadRouter.patch(
  "/assign/:id",
  validate(leadAssigedSchema, "params"),
  checkPermissionMiddleware("ASSIGN_LEAD"),
  assignLeadController
); // Assign lead route requires auth

leadRouter.get(
  "/convert-to-loan/:id",
  validate(leadIdParamSchema, "params"),
  // checkPermissionMiddleware("Convert_Lead_To_Loan"),
  convertLeadToLoanController
); // Convert lead to loan application route requires auth
export default leadRouter;
