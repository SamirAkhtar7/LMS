import { Router } from "express";
import {
  applySettlementController,
  approveSettlementController,
  settleLoanController,
  paySettlementController,
  rejectSettlementController,
  getAllSettlementsController,
    getSettlementByIdController,
    getPayableAmountController,
  getSettlementsByLoanIdController,
  getPendingSettlementsController,
  getRejectedSettlementsController,
  getSettlementDashboardController,
} from "./loanSettlement.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { loanSettlementSchema } from "./loanSettlement.schema.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { approveSettlementSchema } from "./loanSettlement.schema.js";
import { check } from "zod";


const loanSettlementRouter = Router();


loanSettlementRouter.post(
  "/recoveries/:recoveryId/settle",
    authMiddleware,
  checkPermissionMiddleware("SETTLE_LOAN"),
  validate(loanSettlementSchema, "body"),
  settleLoanController
);



loanSettlementRouter.post(
    "/recoveries/:recoveryId/apply-settlement",
    authMiddleware,
        checkPermissionMiddleware("APPLY_SETTLEMENT"),
    applySettlementController
)



loanSettlementRouter.post(
    "/recoveries/:recoveryId/settlement/approve",
    authMiddleware,
    checkPermissionMiddleware("APPROVE_SETTLEMENT"),
    validate(approveSettlementSchema, "body"),
    approveSettlementController
)


loanSettlementRouter.post(
    "/recoveries/:recoveryId/settlement/pay",
    authMiddleware,
        checkPermissionMiddleware("PAY_SETTLEMENT"),
    paySettlementController
)


loanSettlementRouter.get(
     "/recoveries/:recoveryId/settlement/payable-amount",
    authMiddleware,
        checkPermissionMiddleware("VIEW_SETTLEMENT_PAYABLE_AMOUNT"),
     getPayableAmountController
)

loanSettlementRouter.post(
    "/recoveries/:recoveryId/settlement/reject",
    authMiddleware,
        checkPermissionMiddleware("REJECT_SETTLEMENT"),
    rejectSettlementController
)


loanSettlementRouter.get(
    "/settlements",
    authMiddleware,
    checkPermissionMiddleware("VIEW_SETTLEMENTS"),

    getAllSettlementsController
);

loanSettlementRouter.get(
    "/settlements/pending",
    authMiddleware,
    checkPermissionMiddleware("VIEW_SETTLEMENTS"),
    getPendingSettlementsController
);

loanSettlementRouter.get(
    "/settlements/rejected",
    authMiddleware,
    checkPermissionMiddleware("VIEW_SETTLEMENTS"),
    getRejectedSettlementsController
);

loanSettlementRouter.get(
    "/settlements/dashboard",
    authMiddleware,
    checkPermissionMiddleware("VIEW_SETTLEMENT_DASHBOARD"),
    getSettlementDashboardController
);


// loanSettlementRouter.get(
//     "/settlements/:settlementId",
//     authMiddleware,
//     checkPermissionMiddleware("VIEW_SETTLEMENTS"),
//     getSettlementByIdController
// );

loanSettlementRouter.get(
    "/loan-applications/:loanId/settlements",
    authMiddleware,
    checkPermissionMiddleware("VIEW_SETTLEMENTS"),
    getSettlementsByLoanIdController
);





export default loanSettlementRouter;