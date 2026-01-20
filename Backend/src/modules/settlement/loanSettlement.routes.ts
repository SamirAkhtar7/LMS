import { Router } from "express";
import { settleLoanController } from "./loanSettlement.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { loanSettlementSchema } from "./loanSettlement.schema.js";

const loanSettlementRouter = Router();


loanSettlementRouter.post(
  "/recoveries/:recoveryId/settle",
  authMiddleware,
  validate(loanSettlementSchema, "body"),
  settleLoanController
);

export default loanSettlementRouter;