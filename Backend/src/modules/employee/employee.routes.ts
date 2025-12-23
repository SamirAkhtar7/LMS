import { Router } from "express";
import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
} from "./employee.controller.js";
import { validationResultMiddleware } from "../../common/middlewares/validate.js";
import { createEmployeeValidation,updateEmployeeValidation } from "./employee.vaildation.js";

export const employeeRouter = Router();
employeeRouter.post("/", createEmployeeValidation, validationResultMiddleware, createEmployeeController);
employeeRouter.get("/all", getAllEmployeesController);
employeeRouter.post("/:id", updateEmployeeValidation, validationResultMiddleware, updateEmployeeController);
employeeRouter.get("/:id", getEmployeeByIdController);

export default employeeRouter;
