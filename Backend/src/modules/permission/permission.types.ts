export type CreatePermissionBody = {
  code: string;
  name: string;
};

export type AssignPermissionsBody = {
  userId: string;
  permissions: string[]; // array of permission codes
};

export type UserIdParam = {
  userId: string;
};

export type PermissionDto = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type UserPermissionDto = {
  id: string;
  userId: string;
  permissionId: string;
  allowed: boolean;
};
