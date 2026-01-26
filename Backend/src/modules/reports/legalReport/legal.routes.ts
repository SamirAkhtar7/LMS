import { Router } from "express";

import {
  createLegalReportController,
  approvelLegalReportController,
  getAllLegalReportsController,
} from "./legal.controller.js";

import { authMiddleware } from "../../../common/middlewares/auth.middleware.js";
import { validate } from "../../../common/middlewares/zod.middleware.js";
import { approveLegalReportSchema, createLegalReportSchema } from "./legal.schema.js";

const legalReportRouter = Router();

legalReportRouter.post(
  "/loan/:loanId/legal-report",
    authMiddleware,
  validate(createLegalReportSchema),
  createLegalReportController,
);


legalReportRouter.post(
  "/legal-report/:reportId/approve",
    authMiddleware,
   validate(approveLegalReportSchema),
  approvelLegalReportController,
); 

legalReportRouter.get(
  "/legal-reports",
    authMiddleware,
   getAllLegalReportsController,
);


export default legalReportRouter;
