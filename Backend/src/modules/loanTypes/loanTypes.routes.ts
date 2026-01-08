import { Router } from "express";
import { createLoanTypeController,getAllLoanTypesController,getLoanTypeByIdController,deleteLoanTypeController, updateLoanTypeController } from "./loanType.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { createLoanTypeSchema } from "./loanTypes.schema.js";


const LoanTypesRouter = Router();
LoanTypesRouter.use(authMiddleware);

LoanTypesRouter.post(
  "/",
  validate(createLoanTypeSchema),
  checkPermissionMiddleware("create_loan_type")
  , createLoanTypeController);

LoanTypesRouter.get("/",
  checkPermissionMiddleware("view_loan_types")
  , getAllLoanTypesController);


  LoanTypesRouter.get("/:id",
  checkPermissionMiddleware("view_loan_type")
  , getLoanTypeByIdController);

LoanTypesRouter.put("/:id",

  checkPermissionMiddleware("update_loan_type")
  , updateLoanTypeController);


LoanTypesRouter.delete("/:id",
  checkPermissionMiddleware("delete_loan_type"),
  deleteLoanTypeController);



export default LoanTypesRouter;