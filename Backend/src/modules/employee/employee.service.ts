import { prisma } from "../../db/prismaService.js";
import { hashPassword } from "../../common/utils/utils.js";
import { CreateEmployee } from "./employee.types.js";
import * as crypto from "crypto";
import {
  getPagination,
  buildPaginationMeta,
} from "../../common/utils/pagination.js";
import { buildEmployeeSearch } from "../../common/utils/search.js";
import { generateUniqueEmployeeId } from "../../common/generateId/generateEmployeeId.js";
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
        userName: data.userName,
        password: hashedPassword,
        role: data.role,
        contactNumber: data.contactNumber ?? data.mobileNumber ?? "",
        isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      },
    });

    // generate a simple unique employee id
    const employeeId = await generateUniqueEmployeeId();

    // derive a userName for the employee record if not provided

    // normalize dates
    const dobVal = data.dob
      ? typeof data.dob === "string"
        ? new Date(data.dob)
        : data.dob
      : null;
    const dojVal = data.dateOfJoining
      ? typeof data.dateOfJoining === "string"
        ? new Date(data.dateOfJoining)
        : data.dateOfJoining
      : null;

    // create the employee record (use sensible defaults for required fields)
    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeId,
        mobileNumber: data.mobileNumber ?? data.contactNumber ?? "",
        atlMobileNumber: data.atlMobileNumber ?? "",
        dob: dobVal ?? new Date(),
        gender: (data.gender ?? "OTHER") as any,
        maritalStatus: (data.maritalStatus ?? "SINGLE") as any,
        designation: data.designation ?? "",
        emergencyContact: data.emergencyContact ?? "",
        emergencyRelationship: (data.emergencyRelationship ?? "OTHER") as any,
        experience: data.experience ?? "",
        reportingManagerId: data.reportingManagerId ?? "",
        workLocation: (data.workLocation ?? "OFFICE") as any,
        department: data.department ?? "",
        dateOfJoining: dojVal ?? new Date(),
        salary: typeof data.salary === "number" ? data.salary : 0,
        address: data.address ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        pinCode: data.pinCode ?? "",
      },
    });

    // hide password before returning
    const { password: _pw, ...safeUser } = user as any;
    return { user: safeUser, employee };
  } catch (error: unknown) {
    const eAny = error as any;
    if (eAny && eAny.code === "P2002") {
      const e: any = new Error("Duplicate entry");
      e.statusCode = 409;
      throw e;
    }
    throw error;
  }
}
export async function getAllEmployeesService(params: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  const { page, limit, skip } = getPagination(params.page, params.limit);

  const where = buildEmployeeSearch(params.q);

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
  };
}

export async function getEmployeeByIdService(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!employee) {
    const e: any = new Error("Employee not found");
    e.statusCode = 404;
    throw e;
  }

  if (!employee.user) {
    const e: any = new Error("Associated user not found");
    e.statusCode = 404;
    throw e;
  }

  const { password, ...safeUser } = employee.user as any;

  // Fetch KYC records separately — `kyc` is not a direct relation on `User` in schema
  const kycs = await prisma.kyc.findMany({
    where: { userId: employee.userId },
  });

  return {
    ...employee,
    user: safeUser,
    kycs,
  };
}

export async function updateEmployeeService(
  id: string,
  updateData: Partial<CreateEmployee> & Record<string, any>,
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
      "userName",
      "password",
      "role",
      "contactNumber",
    ];
    // accept user updates either at top-level or inside `user` object
    for (const key of userFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        (userUpdateData as any)[key] = (updateData as any)[key];
      }
    }
    if (
      updateData &&
      typeof updateData.user === "object" &&
      updateData.user !== null
    ) {
      for (const [k, v] of Object.entries(updateData.user)) {
        if (userFields.includes(k) || k === "role" || k === "userName") {
          (userUpdateData as any)[k] = v;
        }
      }
    }

    if (userUpdateData.password) {
      userUpdateData.password = await hashPassword(userUpdateData.password);
    }

    // employee-scoped fields
    const empFields = [
      "employeeId",
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

    const prismaData: any = {};
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
  } catch (error: unknown) {
    const eAny = error as any;
    if (eAny && eAny.code === "P2002") {
      const e: any = new Error("Duplicate entry");
      e.statusCode = 409;
      throw e;
    }
    throw error;
  }
}

//Todo: delete employee service

export const getEmployeeDashBoardService = async (employeeId: string) => {
  const assignedLoanIds = await prisma.loanAssignment.findMany({
    where: {
      employeeId,
      isActive: true,
    },
    select: {
      loanApplicationId: true,
    },
  });

  const loanIds = assignedLoanIds.map((l) => l.loanApplicationId);
  if (loanIds.length === 0) {
    return {
      assignedLoans: 0,
      pendingKyc: 0,
      underReview: 0,
      legalTechnicalPending: 0,
      todaysTasks: [],
    };
  }

  const [
    assignedLoans,
    pendingKyc,
    underReview,
    legalPending,
    technicalPending,
  ] = await Promise.all([
    prisma.loanApplication.count({
      where: { id: { in: loanIds } },
    }),
    prisma.loanApplication.count({
      where: {
        id: { in: loanIds },
        status: "kyc_pending",
      },
    }),
    prisma.loanApplication.count({
      where: {
        id: { in: loanIds },
        status: "under_review",
      },
    }),
    prisma.legalReport.count({
      where: {
        loanApplicationId: { in: loanIds },
      },
    }),
    prisma.technicalReport.count({
      where: {
        loanApplicationId: { in: loanIds },
      },
    }),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaysTasks = await prisma.loanApplication.findMany({
    where: {
      id: { in: loanIds },
      OR: [{ status: "kyc_pending" }, { status: "under_review" }],
      updatedAt: {
        gte: todayStart,
      },
    },
    select: {
      id: true,
      loanNumber: true,
      status: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    assignedLoans,
    pendingKyc,
    underReview,
    legalTechnicalPending: legalPending + technicalPending,
    todaysTasks,
  };
};
