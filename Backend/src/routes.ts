import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the LMS Backend!");
});

export default router;
