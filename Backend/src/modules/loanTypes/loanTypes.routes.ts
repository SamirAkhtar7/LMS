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
  checkPermissionMiddleware("CREATE_LOAN_TYPE")
  , createLoanTypeController);

LoanTypesRouter.get("/",
  checkPermissionMiddleware("VIEW_LOAN_TYPES")
  , getAllLoanTypesController);


  LoanTypesRouter.get("/:id",
  checkPermissionMiddleware("VIEW_LOAN_TYPE")
  , getLoanTypeByIdController);

LoanTypesRouter.put("/:id",

  checkPermissionMiddleware("UPDATE_LOAN_TYPE")
  , updateLoanTypeController);


LoanTypesRouter.delete("/:id",
  checkPermissionMiddleware("DELETE_LOAN_TYPE"),
  deleteLoanTypeController);



export default LoanTypesRouter;