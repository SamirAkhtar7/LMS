import e, { Router } from 'express';
import { getSuperAdminDashboardController } from './dashboard.controller.js';
import { authMiddleware } from '../../common/middlewares/auth.middleware.js';
import { checkPermissionMiddleware } from '../../common/middlewares/permission.middleware.js';


export const superAdminRouter = Router();

superAdminRouter.get(
    "/dashboard",
    authMiddleware,
    checkPermissionMiddleware("VIEW_DASHBOARD"),
    getSuperAdminDashboardController,
)