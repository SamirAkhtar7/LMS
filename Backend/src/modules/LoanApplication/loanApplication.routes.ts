import { Router } from "express";
const loanApplicationRouter = Router();
import {
  createLoanApplicationController,
  getAllLoanApplicationsController,
  getLoanApplicationByIdController,
  reviewLoanController,
  approveLoanController,
  rejectLoanController,
  updateLoanApplicationStatusController,
  uploadLoanDocumentsController,
  verifyDocumentController,
} from "./loanApplication.controller.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import {
  createLoanApplicationSchema,
  updateLoanApplicationSchema,
  loanApplicationIdParamSchema,
} from "./loanApplication.schema.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import upload from "../../common/middlewares/multer.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
// Define your loan application routes here
loanApplicationRouter.post(
  "/",
  authMiddleware,
  validate(createLoanApplicationSchema),
  checkPermissionMiddleware("CREATE_LOAN_APPLICATION"),
  createLoanApplicationController
);
loanApplicationRouter.get(
  "/",
  authMiddleware,
  checkPermissionMiddleware("VIEW_LOAN_APPLICATIONS"),
  getAllLoanApplicationsController
);

loanApplicationRouter.get(
  "/:id",
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
  checkPermissionMiddleware("VIEW_LOAN_APPLICATION"),
  getLoanApplicationByIdController
);
loanApplicationRouter.put(
  "/:id/status",
  authMiddleware,
  checkPermissionMiddleware("UPDATE_LOAN_STATUS"),
  validate(updateLoanApplicationSchema, "body"),
  validate(loanApplicationIdParamSchema, "params"),
  updateLoanApplicationStatusController
);
loanApplicationRouter.put(
  "/:id/review",
  authMiddleware,
  checkPermissionMiddleware("REVIEW_LOAN"),
  validate(loanApplicationIdParamSchema, "params"),
  reviewLoanController
);

loanApplicationRouter.put(
  "/:id/approve",
  authMiddleware,
  checkPermissionMiddleware("APPROVE_LOAN"),
  validate(loanApplicationIdParamSchema, "params"),
  approveLoanController
);
loanApplicationRouter.put(
  "/:id/reject",
  authMiddleware,
  checkPermissionMiddleware("REJECT_LOAN"),
  validate(loanApplicationIdParamSchema, "params"),
  rejectLoanController
);

loanApplicationRouter.post(
  "/:id/documents",
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
  upload.fields([
    { name: "aadhaar_front", maxCount: 1 },
    { name: "aadhaar_back", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    // added to accept `pan` from Postman
    { name: "voter_id", maxCount: 1 },
    { name: "salary_slip", maxCount: 1 },
    { name: "bank_statement", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "signature", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "other", maxCount: 1 },
  ]),
  // upload.any(),
  uploadLoanDocumentsController
);

loanApplicationRouter.post(
  "/documents/:id/verify",
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
  checkPermissionMiddleware("VERIFY_DOCUMENTS"),
  verifyDocumentController
);

export default loanApplicationRouter;
