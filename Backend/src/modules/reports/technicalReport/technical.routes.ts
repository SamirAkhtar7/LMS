import { Router } from "express";
import {
    createTechnicalReportController,
    approveTechnicalReportController,
    getAllTechnicalReportsController
} from "./technical.controller.js";
import { checkPermissionMiddleware } from "../../../common/middlewares/permission.middleware.js";

import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";


const technicalReportRouter = Router();

technicalReportRouter.post(
  "/loan-applications/:loanId/technical-reports",
    authMiddleware,
    checkPermissionMiddleware("CREATE_TECHNICAL_REPORT"),
  createTechnicalReportController,
);

technicalReportRouter.post(
    "/technical-reports/:reportId/approve",
    authMiddleware,
    checkPermissionMiddleware("APPROVE_TECHNICAL_REPORT"),
    approveTechnicalReportController,
)

technicalReportRouter.get(
    "/technical-reports",
    authMiddleware,
    checkPermissionMiddleware("VIEW_TECHNICAL_REPORTS"),
    getAllTechnicalReportsController,
)


export default technicalReportRouter;