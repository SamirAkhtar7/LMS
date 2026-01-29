import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

import {
  applyMorationtoriumController,
  editEmiController,
  forecloseLoanController,
  generateEmiScheduleController,
  genrateEmiAmount,
  getLoanEmiController,
  getThisMonthEmiAmountController,
  markEmiPaidController,
  payforecloseLoanController,
  getEmiPayableAmountController,
  getAllEmisController
  // processOverdueEmisController,
} from "./emi.controller.js";

import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";

const emiRouter = Router();

// Example route to generate EMI schedule


  //todo
// ✔ EMI reminders (SMS / Email)
// ✔ Grace period logic
// ✔ Daily late fee accrual
// ✔ Penalty caps
// ✔ Loan rescheduling
// ✔ Statement generation (PDF)


emiRouter.get("/", authMiddleware,
  checkPermissionMiddleware("VIEW_EMIS"),
  getAllEmisController);


emiRouter.post(
  "/loan-applications/:id/emis",
  authMiddleware,
  checkPermissionMiddleware("GENERATE_EMI_SCHEDULE"),
  generateEmiScheduleController
);

emiRouter.get(
  "/loan-applications/:id/emis",
  authMiddleware,
  checkPermissionMiddleware("VIEW_EMIS"),
  getLoanEmiController
);

emiRouter.post(
  "/loan-applications/emi-amount",
  genrateEmiAmount
);

emiRouter.get(
  "/loan-emis/:loanApplicationId/get-emi-details",
  authMiddleware,
  checkPermissionMiddleware("VIEW_EMIS"),
  getThisMonthEmiAmountController
);
emiRouter.post("/:emiId/pay",
  authMiddleware,
  checkPermissionMiddleware("EMI_PAID"),
  markEmiPaidController);

emiRouter.get("/loans/:loanId/foreclose",
  authMiddleware,
  checkPermissionMiddleware("VIEW_FORECLOSE_AMOUNT"),
  forecloseLoanController);
emiRouter.post(
  "/loans/:loanId/foreclose",
  authMiddleware,
  checkPermissionMiddleware("FORECLOSE_LOAN"),
payforecloseLoanController
);


emiRouter.post("/loans/:loanId/moratorium",
  authMiddleware,
  checkPermissionMiddleware("APPLY_MORATORIUM"),
  applyMorationtoriumController);

emiRouter.post("/get-emi-amount",
  authMiddleware,
  checkPermissionMiddleware("GENERATE_EMI_AMOUNT"),
  genrateEmiAmount);

emiRouter.post("/loan-emis/:emiId/pay",
  authMiddleware,
  checkPermissionMiddleware("EMI_PAID"),
  markEmiPaidController);

emiRouter.post("/loan-emis/:emiId/edit",
  authMiddleware,
  checkPermissionMiddleware("EDIT_EMI"),
  editEmiController);
emiRouter.get("/loan-emis/:emiId/payable-amount",
  authMiddleware,
  checkPermissionMiddleware("VIEW_EMI_PAYABLE_AMOUNT"),
  getEmiPayableAmountController);

// emiRouter.post(
//   "/emis/process-overdue",
//   authMiddleware, // optional if cron
//   processOverdueEmisController
// );


export default emiRouter;
