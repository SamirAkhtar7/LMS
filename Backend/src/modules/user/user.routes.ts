import { Router, Request, Response } from "express";
import { createUserController } from "./user.controller.js";
import { createUserValidation } from "./user.validation.js";
import { validationResultMiddleware } from "../../common/middlewares/validate.js";

const router: Router = Router();

// Sample route to get user info
router.post("/create", createUserValidation, validationResultMiddleware, createUserController);

export default router;
