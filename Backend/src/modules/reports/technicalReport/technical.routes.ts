import { Router } from "express";
import {
    createTechinicalReportController,
    approveTeechnicalReportController,
    getAllTechnicalReportsController
} from "./technical.controller.js";

import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";


const technicalReportRouter = Router();

technicalReportRouter.post(
  "/loan-applications/:loanId/technical-reports",
  authMiddleware,
  createTechinicalReportController,
);

technicalReportRouter.post(
    "/technical-reports/:reportId/approve",
    authMiddleware,
    approveTeechnicalReportController,
)

technicalReportRouter.get(
    "/technical-reports",
    authMiddleware,
    getAllTechnicalReportsController,
)


export default technicalReportRouter;