import e, { Request, Response } from "express";
import { createEmployeeService ,getAllEmployeesService ,getEmployeeByIdService ,updateEmployeeService } from "./employee.service.js";


export const createEmployeeController = async (req: Request, res: Response) => {
  try {
    const result = await createEmployeeService(req.body);
    const { user, employee } = result as any;
    const { password: _pw, ...safeUser } = user;
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: { user: safeUser, employee },
    });
  } catch (error: any) {
    if (error.message && error.message.includes("already exists")) {
      return res.status(409).json({ success: false, message: error.message });
    }
    res
      .status(400)
      .json({
        success: false,
        message: "Employee creation failed",
        error: error,
      });
  }
};

export const getAllEmployeesController = async (req: Request, res: Response) => {

    const employees = await getAllEmployeesService();
    res.status(200).json({
        success: true,  
        message: "Employees retrieved successfully",
        data: employees,
    });

};

export const getEmployeeByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const employee = await getEmployeeByIdService(id);
  res.status(200).json({
    success: true,
    message: "Employee retrieved successfully",
    data: employee,
  });
}

export const updateEmployeeController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedEmployee = await updateEmployeeService(id, updateData);
    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Employee update failed",
      error: error.message,
    });
  }
};