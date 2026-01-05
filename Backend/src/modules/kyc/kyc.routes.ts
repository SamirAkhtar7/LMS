import { Router } from "express";
import {
  getMyKycController,
  uploadKycDocumentController,
  verifyKycController,
} from "./kyc.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";
import  upload  from "../../common/middlewares/multer.middleware.js";
import { validate } from "../../common/middlewares/zod.middleware.js";
import { uploadKycDocumentSchema } from "./kyc.schema.js";
const router = Router();

router.post(
  "/document",
  authMiddleware,
  upload.fields([
    { name:"aadhaar_front" },
    { name:"aadhaar_back" },
    { name: "pan_card" },
    { name: "photo" }

  ]),
 

  uploadKycDocumentController
);


router.put(
  "/:id/verify",
  authMiddleware,
 checkPermissionMiddleware("VERIFY_DOCUMENT"),
  verifyKycController
);

router.get(
  "/me",
  authMiddleware,
  getMyKycController
);

export default router;