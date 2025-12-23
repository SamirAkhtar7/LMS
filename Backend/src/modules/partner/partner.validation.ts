import { body, param } from "express-validator";

export const createPartnerValidation = [
  body("fullName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("fullName is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .optional()
    .isIn(["PARTNER"])
    .withMessage("Role must be 'PARTNER'"),
//   body("address")
//     .optional()
//     .isString()
//     .trim()
//     .notEmpty()
//     .withMessage("Address is required"),
  body("phone").isString().trim().notEmpty().withMessage("Phone is required"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  body("partnerType").optional().isString().trim(),
  body("experience").optional().isString().trim(),
  body("targetArea").optional().isString().trim(),
];

export const updatePartnerValidation = [
  body("fullName")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("fullName must be a non-empty string"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .optional()
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("phone")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Phone must be a non-empty string"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
  body("partnerType").optional().isString().trim(),
  body("experience").optional().isString().trim(),
  body("targetArea").optional().isString().trim(),
  body("totalReferrals")
    .optional()
    .isInt({ min: 0 })
    .withMessage("totalReferrals must be a non-negative integer"),
  body("activeReferrals")
    .optional()
    .isInt({ min: 0 })
    .withMessage("activeReferrals must be a non-negative integer"),
  body("commissionEarned")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("commissionEarned must be a non-negative number"),
];

export const partnerIdParam = [
  param("id").isString().notEmpty().withMessage("id param is required"),
];

export default {} as any;
