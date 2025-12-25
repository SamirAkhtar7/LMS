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

// Define lead routes here
leadRouter.post("/", validate(createLeadSchema), createLeadController);

leadRouter.use(authMiddleware);
leadRouter.get("/all", getAllLeadsController);
leadRouter.get("/:id", validate(leadIdParamSchema,"params"), getLeadByIdController);

leadRouter.patch("update-status/:id", validate(leadStatusParamSchema,"params"), updateLeadStatusController);

leadRouter.patch("/assign/:id", validate(leadAssigedSchema), assignLeadController); // Assign lead route requires auth
export default leadRouter;
