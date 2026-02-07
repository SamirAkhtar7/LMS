import { Router } from "express";

import {
  createLegalReportController,
  approvelLegalReportController,
  getAllLegalReportsController,
} from "./legal.controller.js";

import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";
import { validate } from "../../../common/middlewares/zod.middleware.js";
import { approveLegalReportSchema, createLegalReportSchema } from "./legal.schema.js";
import { checkPermissionMiddleware } from "../../../common/middlewares/permission.middleware.js";
const legalReportRouter = Router();

legalReportRouter.post(
  "/loan/:loanId/legal-report",
  authMiddleware,
  checkPermissionMiddleware("CREATE_LEGAL_REPORT"),
  validate(createLegalReportSchema),
  createLegalReportController,
);


legalReportRouter.post(
  "/legal-report/:reportId/approve",
    authMiddleware,
  validate(approveLegalReportSchema),
  checkPermissionMiddleware("APPROVE_LEGAL_REPORT"),
   validate(approveLegalReportSchema),
  approvelLegalReportController,
); 

legalReportRouter.get(
  "/legal-reports",
  authMiddleware,
  //checkPermissionMiddleware("VIEW_LEGAL_REPORTS"),
  getAllLegalReportsController,
);


export default legalReportRouter;
