import type { AssignedRole } from "../../../generated/prisma-client/enums.js";

export type AssigmentRoleType = {
  employeeId: string;
  role: AssignedRole;
};

export type unassignLoanType = {
  assignmentId: string;
};
