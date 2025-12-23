import { prisma } from "../../db/prismaService.js";
import { Prisma } from "@prisma/client";
import { hashPassword } from "../../common/utils/utils.js";
import { CreateEmployee } from "./employee.types.js";


//Todo: add permission checks where necessary

export async function createEmployeeService(data: CreateEmployee) {
  // check if a user with the email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    const e: any = new Error("Email already exists");
    e.statusCode = 409;
    throw e;
  }

  const hashedPassword = await hashPassword(data.password);

  try {
    // create the user first
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone,
        isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      },
    });

    // generate a simple unique employee code
    //todo: improve employee code generation logic
    const employeeCode = `EMP-${Date.now()}`;

    // create the employee record (use sensible defaults for required fields)
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeCode,
        designation: "Employee",
        branchId: "default",
        department: "general",
        joiningDate: new Date(),
      },
    });

    return { user, employee };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const e: any = new Error("Duplicate entry");
      e.statusCode = 409;
      throw e;
    }
    throw error;
  }
}

export async function getAllEmployeesService() {
  const employees = await prisma.employee.findMany();
  return employees;
}

export async function getEmployeeByIdService(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
  });
  return employee;
}

export async function updateEmployeeService(
  id: string,
  updateData: Partial<CreateEmployee> & Record<string, any>
) {
  try {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) {
      const e: any = new Error("Employee not found");
      e.statusCode = 404;
      throw e;
    }

    const userUpdateData: Record<string, any> = {};
    const employeeUpdateData: Record<string, any> = {};

    // user-scoped fields
    const userFields = [
      "fullName",
      "email",
      "password",
      "role",
      "phone",
      "isActive",
    ];
    for (const key of userFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        (userUpdateData as any)[key] = (updateData as any)[key];
      }
    }

    if (userUpdateData.password) {
      userUpdateData.password = await hashPassword(userUpdateData.password);
    }

    // employee-scoped fields
    const empFields = [
      "employeeCode",
      "designation",
      "branchId",
      "department",
      "joiningDate",
    ];
    for (const key of empFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        let val = (updateData as any)[key];
        if (key === "joiningDate" && typeof val === "string") {
          val = new Date(val);
        }
        (employeeUpdateData as any)[key] = val;
      }
    }

    const prismaData: Prisma.EmployeeUpdateArgs["data"] = {} as any;
    if (Object.keys(userUpdateData).length > 0)
      prismaData.user = { update: userUpdateData } as any;
    if (Object.keys(employeeUpdateData).length > 0)
      Object.assign(prismaData, employeeUpdateData);

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: prismaData,
      include: { user: true },
    });
    const { user, ...employeeOnly } = updatedEmployee as any;
    if (user) {
      const { password: _pw, ...safeUser } = user as any;
      return { employee: employeeOnly, user: safeUser };
    }
    return { employee: employeeOnly, user: null };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const e: any = new Error("Duplicate entry");
      e.statusCode = 409;
      throw e;
    }
    throw error;
  }
}


//Todo: delete employee service 