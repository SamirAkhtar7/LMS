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
// Define your loan application routes here
loanApplicationRouter.post(
  "/",
  authMiddleware,
  validate(createLoanApplicationSchema),
  createLoanApplicationController
);
loanApplicationRouter.get("/", authMiddleware, getAllLoanApplicationsController);
loanApplicationRouter.get(
  "/:id",
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
  getLoanApplicationByIdController
);
loanApplicationRouter.put(
  "/:id/status",
  authMiddleware,
  // checkPermissionMiddleware("UPDATE_LOAN_STATUS"),
  validate(updateLoanApplicationSchema, "body"),
  validate(loanApplicationIdParamSchema, "params"),
  updateLoanApplicationStatusController
);

loanApplicationRouter.put(
  "/:id/review",
  //  checkPermissionMiddleware("REVIEW_LOAN"),
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
  reviewLoanController
);

loanApplicationRouter.put(
  "/:id/approve",
  //checkPermissionMiddleware("APPROVE_LOAN"),
  approveLoanController
);

loanApplicationRouter.put(
  "/:id/reject",
  authMiddleware,
  validate(loanApplicationIdParamSchema, "params"),
 // checkPermissionMiddleware("REJECT_LOAN"),
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
/// added to accept `pan` from Postman
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
  // checkPermissionMiddleware("VERIFY_DOCUMENTS"),
  verifyDocumentController
);



export default loanApplicationRouter;
