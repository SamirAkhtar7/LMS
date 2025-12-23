import { Router } from "express";
import { createPartnerController, getAllPartnersController, getPartnerByIdController,updatePartnerController } from "./partner.controller.js";
import { validationResultMiddleware } from "../../common/middlewares/validate.js";
import { createPartnerValidation,updatePartnerValidation } from "./partner.validation.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";


const partnerRouter = Router();

// Define partner routes here
// Protect all routes defined after this middleware
partnerRouter.use(authMiddleware);

partnerRouter.post("/", createPartnerValidation, validationResultMiddleware, createPartnerController);
partnerRouter.get("/all", getAllPartnersController); 
partnerRouter.get("/:id", getPartnerByIdController);
partnerRouter.patch("/:id", updatePartnerValidation, validationResultMiddleware, updatePartnerController); 

//todo: add delete route if needed



export default partnerRouter;