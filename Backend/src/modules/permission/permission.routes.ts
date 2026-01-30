import { Router } from "express";
const permissionRouter = Router();

import {
  assignPermissionsController,
  getUserPermissionsController,
  createPermissionsController,
  getAllPermissionsNameAndCodeController
} from "./permission.controller.js";

import { validate } from "../../common/middlewares/zod.middleware.js";
import {
  assignPermissionsSchema,
  userIdParamSchema,
} from "./permission.schema.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
// Define your permission routes here



permissionRouter.post("/create-permissions",
  authMiddleware,
  checkPermissionMiddleware("CREATE_PERMISSIONS"),
  createPermissionsController);
permissionRouter.post(
  "/assign",
  authMiddleware,
  validate(assignPermissionsSchema),
  checkPermissionMiddleware("ASSIGN_PERMISSIONS"),
    assignPermissionsController
);

permissionRouter.get(
  "/user/:userId",
  authMiddleware,
  validate(userIdParamSchema, "params"),
  checkPermissionMiddleware("VIEW_USER_PERMISSIONS"),
  getUserPermissionsController
);

permissionRouter.get(
    "/all-permissions",
    authMiddleware,
    checkPermissionMiddleware("VIEW_ALL_PERMISSIONS"),
    getAllPermissionsNameAndCodeController
  )

export default permissionRouter;
