import { z } from "zod";

export const reportStatusEnum = z.enum([
  "PENDING",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
]);

export const propertyTypeEnum = z.enum([
  "RESIDENTIAL",
  "COMMERCIAL",
  "LAND",
  "FLAT",
  "VILLA",
  "PLOT",
  "INDUSTRIAL",
]);

export const constructionStatusEnum = z.enum([
  "COMPLETED",
  "UNDER_CONSTRUCTION",
  "NEW_PROJECT",
]);


export const constructionQualityEnum = z.enum(["GOOD", "AVERAGE", "POOR"]);

export const createTechnicalReportSchema = z
  .object({
    loanApplicationId: z.string().min(1),

    /* Engineer / Valuer */
    engineerId: z.string().optional(),
    engineerName: z.string().min(1, "Engineer name is required"),
    agencyName: z.string().optional(),

    /* Property details */
    propertyType: propertyTypeEnum,
    propertyAddress: z.string().min(5),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),

    /* Valuation */
    marketValue: z.number().positive(),
    discussionValue: z.number().positive(),
    forcesdSaleValue: z.number().positive().optional(),
    recommendedLtv: z.number().min(0).max(100),

    /* Construction */
    constructionStatus: constructionStatusEnum,
    propertyAge: z.number().int().min(0).optional(),
    residualLife: z.number().int().min(0).optional(),
    qualityOfConstruction: constructionQualityEnum.optional(),

    /* Decision */
    status: reportStatusEnum.optional(),
    remarks: z.string().optional(),

    /* Documents */
    reportUrl: z.string().url().optional(),
    sitePhotographs: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    /* 🔒 Bank-level validations */

    if (
      data.constructionStatus === "COMPLETED" &&
      (data.propertyAge === undefined || data.residualLife === undefined)
    ) {
      ctx.addIssue({
        path: ["propertyAge"],
        message:
          "Property age and residual life are required for completed projects",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.discussionValue > data.marketValue) {
      ctx.addIssue({
        path: ["discussionValue"],
        message: "Discussion value cannot exceed market value",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.recommendedLtv > 90) {
      ctx.addIssue({
        path: ["recommendedLtv"],
        message: "Recommended LTV above 90% requires senior approval",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.status === "REJECTED" && !data.remarks) {
      ctx.addIssue({
        path: ["remarks"],
        message: "Remarks are mandatory when technical report is rejected",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const approveTechnicalReportSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  remarks: z.string().optional(),
});