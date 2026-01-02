import { Router } from "express";
import { uploadKycDocumentController, updateKycStatusController, verifyDocumentSController } from "./kyc.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import  upload  from "../../common/middlewares/multer.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { uploadKycDocumentSchema } from "./kyc.schema.js";
const router = Router();

router.post(
  "/document/upload",
  authMiddleware,
 // checkPermissionMiddleware("UPLOAD_DOCUMENT"),
  upload.single("document"),
  validate(uploadKycDocumentSchema),
  uploadKycDocumentController
);


router.put(
  "/document/:id/verify",
  authMiddleware,
 // checkPermissionMiddleware("VERIFY_DOCUMENT"),
    verifyDocumentSController

)

router.put(
  "/:id/status",
  authMiddleware,
  //checkPermissionMiddleware("UPDATE_KYC_STATUS"),
  updateKycStatusController
);

export default router;