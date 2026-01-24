import { Router } from "express";
import { refreshCreditReportController } from "./creditReport.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { refreshCreditReportSchema } from "./creditReport.schema.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";


const creditReportRouter = Router();

creditReportRouter.post(
    "/credit-report/:customerId/refresh",
    authMiddleware,
    checkPermissionMiddleware("REFRESH_CREDIT_REPORT"),
    validate(refreshCreditReportSchema),
    refreshCreditReportController
);

export default creditReportRouter;