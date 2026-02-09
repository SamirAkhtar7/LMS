import { createAuditlogService } from "./audit.service.js";
import { CreateAuditLogInput } from "./audit.types.js";

export const logAction = async (params: CreateAuditLogInput) => {
  await createAuditlogService(params);
};
