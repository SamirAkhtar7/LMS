import { Router } from "express";
import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
} from "./employee.controller.js";
import {validate } from "../../common/middlewares/zod.middleware.js";
import {createEmployeeSchema, updateEmployeeSchema, employeeIdParamSchema
} from "./employee.schema.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";

export const employeeRouter = Router();

// Protect all routes defined after this middleware
employeeRouter.use(authMiddleware);
employeeRouter.post(
  "/",
validate(createEmployeeSchema),
checkPermissionMiddleware("Create_Employee"),
  createEmployeeController
);
employeeRouter.get("/all",
  checkPermissionMiddleware("View_All_Employees"),
  getAllEmployeesController);
employeeRouter.patch(
  "/:id",
  validate(employeeIdParamSchema, "params"),
  validate(updateEmployeeSchema),
  checkPermissionMiddleware("Update_Employee"),
  updateEmployeeController
);
employeeRouter.get("/:id",
  validate(employeeIdParamSchema, "params"),
  checkPermissionMiddleware("View_Employee_Details"),
  getEmployeeByIdController);

export default employeeRouter;
