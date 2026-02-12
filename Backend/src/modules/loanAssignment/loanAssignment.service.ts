import { prisma } from "../../db/prismaService.js";
import { AssignedRole } from "../../../generated/prisma-client/enums.js";
import { logAction } from "../../audit/audit.helper.js";

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
    include: { user: { select: { fullName: true } } },
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

  // Check if there's an inactive assignment that needs to be reactivated
  const inactiveAssignment = await prisma.loanAssignment.findFirst({
    where: {
      loanApplicationId,
      employeeId,
      role,
      isActive: false,
    },
  });

  let assignment;
  if (inactiveAssignment) {
    // Reactivate the existing assignment
    assignment = await prisma.loanAssignment.update({
      where: { id: inactiveAssignment.id },
      data: {
        isActive: true,
        assignedBy: assignedById,
        assignedAt: new Date(),
        unassignedAt: null,
        unassignedBy: null,
      },
    });
  } else {
    // Create new assignment
    assignment = await prisma.loanAssignment.create({
      data: {
        loanApplicationId,
        employeeId,
        role,
        assignedBy: assignedById,
      },
    });
  }

  // Log the assignment action
  await logAction({
    entityType: "LOAN_ASSIGNMENT",
    entityId: assignment.id,
    action: "ASSIGN_LOAN",
    performedBy: assignedById,
    branchId: loan.branchId,
    oldValue: null,
    newValue: {
      loanApplicationId,
      employeeId,
      employeeName: employee.user.fullName,
      role,
      isActive: true,
    },
    remarks: `Loan ${loan.loanNumber} assigned to ${employee.user.fullName} as ${role}`,
  });

  return assignment;
};

export const unassignloanService = async (
  assignmentId: string,
  unassignedById: string,
) => {
  // Fetch existing assignment before updating
  const existingAssignment = await prisma.loanAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      loanApplication: { select: { loanNumber: true, branchId: true } },
      employee: { include: { user: { select: { fullName: true } } } },
    },
  });

  if (!existingAssignment) {
    const err: any = new Error("Loan assignment not found");
    err.statusCode = 404;
    throw err;
  }

  if (!existingAssignment.isActive) {
    const err: any = new Error("Assignment is already inactive");
    err.statusCode = 400;
    throw err;
  }

  const updatedAssignment = await prisma.loanAssignment.update({
    where: { id: assignmentId },
    data: {
      isActive: false,
      unassignedBy: unassignedById,
      unassignedAt: new Date(),
    },
  });

  // Log the unassignment action
  await logAction({
    entityType: "LOAN_ASSIGNMENT",
    entityId: assignmentId,
    action: "UNASSIGN_LOAN",
    performedBy: unassignedById,
    branchId: existingAssignment.loanApplication.branchId,
    oldValue: {
      isActive: true,
      employeeName: existingAssignment.employee.user.fullName,
      role: existingAssignment.role,
    },
    newValue: {
      isActive: false,
      unassignedAt: updatedAssignment.unassignedAt,
    },
    remarks: `Loan ${existingAssignment.loanApplication.loanNumber} unassigned from ${existingAssignment.employee.user.fullName} (${existingAssignment.role})`,
  });

  return updatedAssignment;
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
