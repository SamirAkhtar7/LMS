import { Router } from "express";

const branchAdminRouter = Router();

import {
  createBranchAdminController,
  updateBranchAdminController,
} from "./branchAdmin.controller.js";

import { authMiddleware } from "../../common/middlewares/auth.middleware.js";

// Protect all routes with authentication
branchAdminRouter.use(authMiddleware);

branchAdminRouter.post("/create-admin", createBranchAdminController);

branchAdminRouter.put("/update-admin/:id", updateBranchAdminController);

export default branchAdminRouter;
