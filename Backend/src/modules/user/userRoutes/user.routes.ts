import { Router, Request, Response } from "express";
import {
  createUserController,
  getallUsersController,
  getUserByIdController,
  updateUserController,
} from "../userController/user.controller.js";
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from "../userValidation/user.schema.js";
import {validate} from "../../../common/middlewares/zod.middleware.js";
import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../../common/middlewares/permission.middleware.js";

const router: Router = Router();

// Protect all routes defined after this middleware
router.post(
  "/create",
  validate(createUserSchema),
  createUserController
);
router.use(authMiddleware);

router.get("/all",
  authMiddleware,
  checkPermissionMiddleware("View_All_Users"),
  getallUsersController);
router.get("/:id",
  authMiddleware,
  validate(userIdParamSchema, "params"),
  checkPermissionMiddleware("View_User_Details"),
  getUserByIdController);
router.patch(
  "/:id",
  authMiddleware,
  validate(userIdParamSchema, "params"),
  validate(updateUserSchema ,"body"),
  checkPermissionMiddleware("Update_User"),
  updateUserController
);

export default router;
