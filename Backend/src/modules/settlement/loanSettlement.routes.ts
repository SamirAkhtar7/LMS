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
`   `

const loanSettlementRouter = Router();


loanSettlementRouter.post(
  "/recoveries/:recoveryId/settle",
  authMiddleware,
  validate(loanSettlementSchema, "body"),
  settleLoanController
);



loanSettlementRouter.post(
    "/recoveries/:recoveryId/apply-settlement",
    authMiddleware,
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
    paySettlementController
)


loanSettlementRouter.get(
     "/recoveries/:recoveryId/settlement/payable-amount",
     authMiddleware,
     getPayableAmountController
)

loanSettlementRouter.post(
    "/recoveries/:recoveryId/settlement/reject",
    authMiddleware,
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