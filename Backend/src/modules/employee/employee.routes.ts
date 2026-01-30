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
checkPermissionMiddleware("CREATE_EMPLOYEE"),
  createEmployeeController
);
employeeRouter.get("/all",
  checkPermissionMiddleware("VIEW_ALL_EMPLOYEES"),
  getAllEmployeesController);
employeeRouter.patch(
  "/:id",
  validate(employeeIdParamSchema, "params"),
  validate(updateEmployeeSchema),
  checkPermissionMiddleware("UPDATE_EMPLOYEE"),
  updateEmployeeController
);
employeeRouter.get("/:id",
  validate(employeeIdParamSchema, "params"),
  checkPermissionMiddleware("VIEW_EMPLOYEE_DETAILS"),
  getEmployeeByIdController);

export default employeeRouter;
