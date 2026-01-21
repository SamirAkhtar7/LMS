import { Router } from "express";
import { getAllDefaultedLoansController, getDefaultedLoanByIdController } from "./loanDefault.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";

const loanDefaultRouter = Router(); 


loanDefaultRouter.get(
    "/defaulted",
    authMiddleware,
    checkPermissionMiddleware("VIEW_DEFAULTED_LOANS"),
    getAllDefaultedLoansController 
); 


loanDefaultRouter.get(
    "/defaulted/:loanId",
    authMiddleware,
    checkPermissionMiddleware("VIEW_DEFAULTED_LOANS"),
    getDefaultedLoanByIdController 
); 


export default loanDefaultRouter; 