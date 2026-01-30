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
  authMiddleware,
  validate(createPartnerSchema),
  checkPermissionMiddleware("CREATE_PARTNER"),
  createPartnerController
);
partnerRouter.get(
  "/all",
  authMiddleware,
  checkPermissionMiddleware("VIEW_ALL_PARTNERS"),
  getAllPartnersController
);
partnerRouter.get(
  "/:id",
  authMiddleware,
  validate(partnerIdParamSchema, "params"),
  checkPermissionMiddleware("VIEW_PARTNER_DETAILS"),
  getPartnerByIdController
);
partnerRouter.patch(
  "/:id",
  authMiddleware,
  validate(partnerIdParamSchema, "params"),
  validate(updatePartnerSchema),
  checkPermissionMiddleware("UPDATE_PARTNER"),
  updatePartnerController
);

//todo: add delete route if needed

export default partnerRouter;
