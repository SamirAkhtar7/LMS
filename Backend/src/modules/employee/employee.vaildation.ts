import { query, body, param } from "express-validator";

export const createEmployeeValidation = [
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
    .isIn(["EMPLOYEE"])
    .withMessage("Role must be 'EMPLOYEE'"),
  //   body("address")
  //     .isString()
  //     .trim()
  //     .notEmpty()
  //     .withMessage("Address is required"),
  body("phone").isString().trim().notEmpty().withMessage("Phone is required"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),
];

export const updateEmployeeValidation = [
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
  body("role")
    .optional()
    .isIn(["ADMIN", "EMPLOYEE", "PARTNER"])
    .withMessage("Invalid role"),
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

  //TODO EmployeeCode not updatable in future
  body("employeeCode")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("employeeCode must be a non-empty string"),
  body("designation")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("designation must be a non-empty string"),
  body("branchId")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("branchId must be a non-empty string"),
  body("department")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("department must be a non-empty string"),
  body("joiningDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("joiningDate must be a valid ISO8601 date"),
];
