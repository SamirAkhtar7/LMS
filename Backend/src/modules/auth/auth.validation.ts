import { body } from "express-validator";

export const loginValidation = [
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("userName").optional().isString().withMessage("Valid userName is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
