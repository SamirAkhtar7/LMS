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

export const employeeRouter = Router();

// Protect all routes defined after this middleware
employeeRouter.use(authMiddleware);
employeeRouter.post(
  "/",
validate(createEmployeeSchema),

  createEmployeeController
);
employeeRouter.get("/all", getAllEmployeesController);
employeeRouter.patch(
  "/:id",
validate(updateEmployeeSchema),

  updateEmployeeController
);
employeeRouter.get("/:id",
  validate(employeeIdParamSchema, "params"),
  getEmployeeByIdController);

export default employeeRouter;
