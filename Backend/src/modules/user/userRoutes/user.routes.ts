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

const router: Router = Router();

// Protect all routes defined after this middleware
router.use(authMiddleware);
router.post(
  "/create",
validate(createUserSchema),
  createUserController
);

router.get("/all", getallUsersController);
router.get("/:id",
  validate(userIdParamSchema, "params"),
  getUserByIdController);
router.patch(
  "/:id",
validate(updateUserSchema),
  updateUserController
);

export default router;
