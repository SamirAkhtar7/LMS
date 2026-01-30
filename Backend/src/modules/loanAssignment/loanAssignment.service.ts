import { prisma } from "../../db/prismaService.js";
import { AssignedRole } from "../../../generated/prisma-client/enums.js";

export const assignLoanService = async (
  loanApplicationId: string,
  employeeId: string,
  role: AssignedRole,
  assignedById: string,
) => {
  const loan = await prisma.loanApplication.findUnique({
    where: { id: loanApplicationId },
  });

  if (!loan) {
    throw new Error("Loan Application not found");
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const existing = await prisma.loanAssignment.findFirst({
    where: {
      loanApplicationId,
      employeeId,
      role,
      isActive: true,
    },
  });

  if (existing) {
    throw new Error(
      "Active assignment already exists for this loan, employee, and role",
    );
  }

  return prisma.loanAssignment.create({
    data: {
      loanApplicationId,
      employeeId,
      role,
      assignedBy: assignedById,
    },
  });
};

export const unassignloanService = async (
  assignmentId: string,
  unassignedById: string,
) => {
  return prisma.loanAssignment.update({
    where: { id: assignmentId },
    data: {
      isActive: false,
      unassignedBy: unassignedById,
      unassignedAt: new Date(),
    },
  });
};

export const getAssignedLoansForEmployeeService = async (userId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { userId },
  });
  if (!employee) {
    throw new Error("Employee not found");
  }
  const employeeId = employee.id;

  const loans = await prisma.loanApplication.findMany({
    where: {
      loanAssignments: {
        some: {
          employeeId,
          isActive: true,
        },
      },
    },
    include: { customer: true, loanAssignments: true },
  });
  return loans;
};
