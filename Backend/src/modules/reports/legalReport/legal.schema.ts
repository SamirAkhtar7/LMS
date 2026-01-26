import { z } from "zod";

/* ---------------- ENUMS ---------------- */

export const reportStatusEnum = z.enum([
  "PENDING",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
]);

export const ownershipTypeEnum = z.enum(["SELF", "JOINT", "INHERITED"]);

/* ---------------- CREATE LEGAL REPORT ---------------- */

export const createLegalReportSchema = z
  .object({
 
    /* Advocate */
    advocateId: z.string().optional(),
    advocateName: z.string().min(1, "Advocate name is required"),
    lawFirmName: z.string().optional(),

    /* Title Details */
    ownerName: z.string().min(1),
    ownershipType: ownershipTypeEnum,

    titleClear: z.boolean(),
    titleChainYears: z.number().int().min(1),

    /* Encumbrance */
    encumbranceFound: z.boolean(),
    encumbranceDetails: z.string().optional(),

    /* Regulatory */
    reraRegistered: z.boolean().optional(),
    landUserClear: z.boolean().optional(),
    buildingApproval: z.boolean().optional(),

    /* Decision */
    status: reportStatusEnum.optional(),
    remarks: z.string().optional(),

    /* Document */
    reportUrl: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.encumbranceFound && !data.encumbranceDetails) {
      ctx.addIssue({
        path: ["encumbranceDetails"],
        message: "Encumbrance details are required if encumbrance is found",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.titleClear && !data.remarks) {
      ctx.addIssue({
        path: ["remarks"],
        message: "Remarks required if title is not clear",
        code: z.ZodIssueCode.custom,
      });
    }
  });



  export const approveLegalReportSchema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]).optional(),
    remarks: z.string().optional(),
  });
