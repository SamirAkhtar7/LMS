import { query, body, param } from "express-validator";

export const createUserValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("role")
    .isIn(["ADMIN", "EMPLOYEE", "PARTNER"])
    .withMessage("Role must be one of ADMIN, EMPLOYEE, PARTNER"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
];

export const updateUserValidation = [
  body("fullName")
    .optional()
    .isString()
    .trim()
    .notEmpty() 
    .withMessage("Full name must be a non-empty string"),
  body("email")
    .optional()
    .isEmail()  
    .withMessage("Valid email is required"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("role")
    .optional()
    .isIn(["ADMIN", "EMPLOYEE", "PARTNER"])
    .withMessage("Role must be one of ADMIN, EMPLOYEE, PARTNER"),
  body("phone")
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Phone number must be a non-empty string"),
];  
