import { Router } from "express";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

import {
  applyMorationtoriumController,
  forecloseLoanController,
  generateEmiScheduleController,
  genrateEmiAmount,
  getLoanEmiController,
  getThisMonthEmiAmountController,
  markEmiPaidController,
  payforecloseLoanController,
  // processOverdueEmisController,
} from "./emi.controller.js";

const emiRouter = Router();

// Example route to generate EMI schedule


  //todo
// ✔ EMI reminders (SMS / Email)
// ✔ Grace period logic
// ✔ Daily late fee accrual
// ✔ Penalty caps
// ✔ Loan rescheduling
// ✔ Statement generation (PDF)

emiRouter.post(
  "/loan-applications/:id/emis",
  authMiddleware,
  generateEmiScheduleController
);

emiRouter.get(
  "/loan-applications/:id/emis",
  authMiddleware,
  getLoanEmiController
);

emiRouter.post(
  "/loan-applications/emi-amount",
  authMiddleware,
  genrateEmiAmount
);

emiRouter.get(
  "/loan-emis/:loanApplicationId/get-emi-details",
  authMiddleware,
  getThisMonthEmiAmountController
);
emiRouter.post("/:emiId/pay", authMiddleware, markEmiPaidController);

emiRouter.get("/loans/:loanId/foreclose", authMiddleware, forecloseLoanController);
emiRouter.post(
  "/loans/:loanId/foreclose",
  authMiddleware,
payforecloseLoanController
);


emiRouter.post("/loans/:loanId/moratorium", authMiddleware, applyMorationtoriumController);

emiRouter.post("/get-emi-amount", authMiddleware, genrateEmiAmount);

emiRouter.post("/loan-emis/:emiId/pay", authMiddleware, markEmiPaidController);


// emiRouter.post(
//   "/emis/process-overdue",
//   authMiddleware, // optional if cron
//   processOverdueEmisController
// );

export default emiRouter;
