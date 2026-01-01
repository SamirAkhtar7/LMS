import { Router } from "express";
import { createLeadSchema , updateLeadSchema,leadIdParamSchema,leadStatusParamSchema, leadAssigedSchema} from "./lead.schema.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import {
  assignLeadController,
  createLeadController,
  getAllLeadsController,
  getLeadByIdController,
  updateLeadStatusController,
} from "./lead.controller.js";
import router from "../../routes.js";
export const leadRouter = Router();
import {checkPermissionMiddleware} from "../../common/middlewares/permission.middleware.js";

// Define lead routes here
leadRouter.post("/", validate(createLeadSchema), createLeadController);

leadRouter.use(authMiddleware);
leadRouter.get(
  "/all",
  checkPermissionMiddleware("View_All_Leads"),
  getAllLeadsController
);
leadRouter.get("/:id", validate(leadIdParamSchema, "params"),
  checkPermissionMiddleware("View_Lead_Details"),
  getLeadByIdController);

leadRouter.patch("/update-status/:id", validate(leadStatusParamSchema, "params"),
  checkPermissionMiddleware("Update_Lead_Status"),
  updateLeadStatusController);

leadRouter.patch("/assign/:id", validate(leadAssigedSchema, "params"),
  checkPermissionMiddleware("Assign_Lead"),
  assignLeadController); // Assign lead route requires auth
export default leadRouter;
