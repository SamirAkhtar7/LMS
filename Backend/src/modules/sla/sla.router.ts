import { Router } from "express";

const slaRouter = Router();

import { getSlaBreachesController } from "./sla.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";


slaRouter.get(
    "/breaches",
    authMiddleware,
    checkPermissionMiddleware("VIEW_SLA_BREACHES"),
    getSlaBreachesController 
);

export default slaRouter;