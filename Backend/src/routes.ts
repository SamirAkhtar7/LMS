import { Router, Request, Response } from "express";
import userRoutes from "./modules/user/user.routes.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the LMS Backend!");
});
router.use("/users", userRoutes);

export default router;
