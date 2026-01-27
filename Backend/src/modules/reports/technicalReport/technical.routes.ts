import { Router } from "express";
import {
    createTechnicalReportController,
    approveTechnicalReportController,
    getAllTechnicalReportsController
} from "./technical.controller.js";

import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";


const technicalReportRouter = Router();

technicalReportRouter.post(
  "/loan-applications/:loanId/technical-reports",
  authMiddleware,
  createTechnicalReportController,
);

technicalReportRouter.post(
    "/technical-reports/:reportId/approve",
    authMiddleware,
    approveTechnicalReportController,
)

technicalReportRouter.get(
    "/technical-reports",
    authMiddleware,
    getAllTechnicalReportsController,
)


export default technicalReportRouter;