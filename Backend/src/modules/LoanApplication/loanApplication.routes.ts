import { Router } from "express";
const loanApplicationRouter = Router();
import {
  createLoanApplicationController,
  getAllLoanApplicationsController,
  getLoanApplicationByIdController,
  updateLoanApplicationStatusController
} from "./loanApplication.controller.js";
import{ validate } from "../../common/middlewares/zod.middleware.js";
import {
  createLoanApplicationSchema,
  loanApplicationIdParamSchema
} from "./loanApplication.schema.js";

// Define your loan application routes here
loanApplicationRouter.post("/", validate(createLoanApplicationSchema), createLoanApplicationController);
loanApplicationRouter.get("/", getAllLoanApplicationsController);
loanApplicationRouter.get("/:id", getLoanApplicationByIdController);
loanApplicationRouter.put("/:id/status", updateLoanApplicationStatusController);

export default loanApplicationRouter;