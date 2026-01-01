import { Router } from "express";
const permissionRouter = Router();

import {
  assignPermissionsController,
  getUserPermissionsController,
  createPermissionsController,
} from "./permission.controller.js";

import { validate } from "../../common/middlewares/zod.middleware.js";
import {
  assignPermissionsSchema,
  userIdParamSchema,
} from "./permission.schema.js";
// Define your permission routes here



permissionRouter.post("/create-permissions", createPermissionsController);
permissionRouter.post(
    "/assign",
    validate(assignPermissionsSchema),
    assignPermissionsController
);

permissionRouter.get(
    "/user/:userId",
    validate(userIdParamSchema, "params"),
    getUserPermissionsController
);
export default permissionRouter;
