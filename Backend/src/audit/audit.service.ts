import { prisma } from "../db/prismaService.js";

import { CreateAuditLogInput } from "./audit.types.js";

export const createAuditlogService = async (input: CreateAuditLogInput) => {
    return prisma.auditLog.create({
        data: {
            entityId: input.entityId,
            entityType: input.entityType,
            action: input.action,
            performedBy: input.performedBy,
            branchId: input.branchId,
            oldValue: input.oldValue,
            newValue: input.newValue,
            remarks: input.remarks,
        },
    });
}
