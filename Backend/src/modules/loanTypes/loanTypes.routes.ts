import { Router } from "express";
import { createLoanTypeController } from "./loanType.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { createLoanTypeSchema } from "./loanTypes.schema.js";

const LoanTypesRouter = Router();

LoanTypesRouter.post(
  "/",
    authMiddleware,
  validate(createLoanTypeSchema),
  checkPermissionMiddleware("create_loan_type")
,  createLoanTypeController);
LoanTypesRouter.get("/",);
LoanTypesRouter.get("/:id",);
LoanTypesRouter.put("/:id",);
LoanTypesRouter.delete("/:id",)


export default LoanTypesRouter;