import { Router } from "express";
import { loginController } from "./auth.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

export const authRouter = Router();

// Public route
authRouter.post("/login", loginController);

// Protect all routes defined after this middleware
authRouter.use(authMiddleware);

export default authRouter;
