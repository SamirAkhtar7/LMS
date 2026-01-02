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
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
// Define your permission routes here



permissionRouter.post("/create-permissions",
 // checkPermissionMiddleware("Create_Permissions"),
  createPermissionsController);
permissionRouter.post(
    "/assign",
  validate(assignPermissionsSchema),
  //checkPermissionMiddleware("Assign_Permissions"),
    assignPermissionsController
);

permissionRouter.get(
    "/user/:userId",
  validate(userIdParamSchema, "params"),
  //checkPermissionMiddleware("View_User_Permissions"),
    getUserPermissionsController
);
export default permissionRouter;
