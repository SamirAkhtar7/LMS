import { Router } from "express";

import {
  activateMandateController,
  cancelMandateController,
  createNachMandateController,
  getMandateByLoanApplicationIdController,
  suspendMandateController,
} from "./nach.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { createNachSchema } from "./nach.schema.js";

const nachRouter = Router();
nachRouter.use(authMiddleware);

nachRouter.post(
  "/",
  validate(createNachSchema),
  checkPermissionMiddleware("CREATE_NACH_MANDATE"),
  createNachMandateController,
);

nachRouter.post(
  "/:id/activate",
  checkPermissionMiddleware("ACTIVATE_NACH_MANDATE"),
  activateMandateController,
);

nachRouter.post(
  "/:id/suspend",
  checkPermissionMiddleware("SUSPEND_NACH_MANDATE"),
  suspendMandateController,
);

nachRouter.post(
  "/:id/cancel",
  checkPermissionMiddleware("CANCEL_NACH_MANDATE"),
  cancelMandateController,
);
nachRouter.get(
  "/loan/:loanApplicationId",
  checkPermissionMiddleware("VIEW_NACH_MANDATE"),
  getMandateByLoanApplicationIdController,
);

export default nachRouter;
