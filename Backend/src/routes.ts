import { Router, Request, Response } from "express";
import userRoutes from "./modules/user/userRoutes/user.routes.js";
import { authRouter } from "./modules/auth/auth.route.js";
import { employeeRouter } from "./modules/employee/employee.routes.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the LMS Backend!");
});
router.use("/users", userRoutes);
router.use("/auth", authRouter);
router.use("/employee", employeeRouter);

export default router;
