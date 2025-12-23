import { Router } from "express";
import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
} from "./employee.controller.js";

export const employeeRouter = Router();
employeeRouter.post("/", createEmployeeController);
employeeRouter.get("/", getAllEmployeesController);
employeeRouter.post("/:id", updateEmployeeController);
employeeRouter.get("/:id", getEmployeeByIdController);

export default employeeRouter;
