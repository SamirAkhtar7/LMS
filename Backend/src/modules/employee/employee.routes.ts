import { Router } from "express";
import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
} from "./employee.controller.js";
import { validationResultMiddleware } from "../../common/middlewares/validate.js";
import {
  createEmployeeValidation,
  updateEmployeeValidation,
} from "./employee.vaildation.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

export const employeeRouter = Router();

// Protect all routes defined after this middleware
employeeRouter.use(authMiddleware);
employeeRouter.post(
  "/",
  createEmployeeValidation,
  validationResultMiddleware,
  createEmployeeController
);
employeeRouter.get("/all", getAllEmployeesController);
employeeRouter.patch(
  "/:id",
  updateEmployeeValidation,
  validationResultMiddleware,
  updateEmployeeController
);
employeeRouter.get("/:id", getEmployeeByIdController);

export default employeeRouter;
