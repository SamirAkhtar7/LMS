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

const partnerRouter = Router();

// Define partner routes here
// Protect all routes defined after this middleware
partnerRouter.use(authMiddleware);

partnerRouter.post("/", validate(createPartnerSchema), createPartnerController);
partnerRouter.get("/all", getAllPartnersController);
partnerRouter.get("/:id", validate(partnerIdParamSchema, "params"), getPartnerByIdController);
partnerRouter.patch(
  "/:id",
  validate(updatePartnerSchema),
  updatePartnerController
);

//todo: add delete route if needed

export default partnerRouter;
