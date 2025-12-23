import { Router, Request, Response } from "express";
import {
  createUserController,
  getallUsersController,
  getUserByIdController,
  updateUserController,
} from "../userController/user.controller.js";
import {
  createUserValidation,
  updateUserValidation,
} from "../userValidation/user.validation.js";
import { validationResultMiddleware } from "../../../common/middlewares/validate.js";
import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";

const router: Router = Router();

// Sample route to get user info
// Protect all routes defined after this middleware
router.use(authMiddleware);
router.post(
  "/create",
  createUserValidation,
  validationResultMiddleware,
  createUserController
);

router.get("/all", getallUsersController);
router.get("/:id", getUserByIdController);
router.patch(
  "/:id",
  updateUserValidation,
  validationResultMiddleware,
  updateUserController
);

export default router;
