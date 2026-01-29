import { Router } from "express";
import { checkEligibilityController } from "./ruleEngine.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { eligibilityCheckSchema } from "./ruleEngine.schema.js";
const eligibilityRouter = Router();

eligibilityRouter.get(
  "/eligibility-check/:loanApplicationId",
  authMiddleware,
  validate(eligibilityCheckSchema, "params"),
  checkPermissionMiddleware("CHECK_ELIGIBILITY"),
  checkEligibilityController,
);

export default eligibilityRouter;
