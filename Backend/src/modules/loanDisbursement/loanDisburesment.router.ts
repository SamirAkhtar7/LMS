import { Router } from "express";
import { disburseloanController } from "./loanDisbursement.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { disburseLoanSchema } from "./loanDisbursement.schema.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
const loanDisbursementRouter = Router();

loanDisbursementRouter.post(
    "/:id/disburse",
    authMiddleware,
    checkPermissionMiddleware("DISBURSE_LOAN"),
    validate(disburseLoanSchema),
    disburseloanController,
);
export default loanDisbursementRouter;