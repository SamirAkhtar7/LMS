import { Router } from "express";
import { createLeadSchema } from "./lead.schema.js";
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
leadRouter.get("/:id", getLeadByIdController);

leadRouter.patch("update-status/:id", updateLeadStatusController);

leadRouter.patch("/assign/:id", assignLeadController); // Assign lead route requires auth

export default leadRouter;
