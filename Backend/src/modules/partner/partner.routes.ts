import { Router } from "express";
import {
  createPartnerController,
  getAllPartnersController,
  getPartnerByIdController,
  updatePartnerController,
} from "./partner.controller.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import {
  createPartnerSchema,
  updatePartnerSchema,
  partnerIdParamSchema,
} from "./partner.schema.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";

const partnerRouter = Router();

// Define partner routes here
// Protect all routes defined after this middleware
partnerRouter.use(authMiddleware);

partnerRouter.post(
  "/",
  validate(createPartnerSchema),
  checkPermissionMiddleware("Create_Partner"),
  createPartnerController
);
partnerRouter.get(
  "/all",
  checkPermissionMiddleware("View_All_Partners"),
  getAllPartnersController
);
partnerRouter.get(
  "/:id",
  validate(partnerIdParamSchema, "params"),
  checkPermissionMiddleware("View_Partner_Details"),
  getPartnerByIdController
);
partnerRouter.patch(
  "/:id",
  validate(partnerIdParamSchema, "params"),
  validate(updatePartnerSchema),
  checkPermissionMiddleware("Update_Partner"),
  updatePartnerController
);

//todo: add delete route if needed

export default partnerRouter;
