import{ Router } from "express";
const coApplicantRouter = Router();
import { getAllCoApplicantController, reuploadCoApplicantDocumentController, uploadCoApplicantDocumentsController } from "./coApplicant.controller.js";
import { authMiddleware } from "../../common/middlewares/auth.middleware.js";
import upload from "../../common/middlewares/multer.middleware.js";
import { checkPermissionMiddleware } from "../../common/middlewares/permission.middleware.js";

coApplicantRouter.post(
  "/documents/:coApplicantId/upload",
  authMiddleware,
  checkPermissionMiddleware("UPLOAD_DOCUMENTS"),
  upload.any(),
  uploadCoApplicantDocumentsController,
);

coApplicantRouter.put(
    "/documents/:coApplicantId/:documentType/reupload",
    authMiddleware,
    checkPermissionMiddleware("UPLOAD_DOCUMENTS"),
    upload.single("document"),
    reuploadCoApplicantDocumentController,
)


coApplicantRouter.get(
    "/loan/:loanApplicationId",
    authMiddleware,
    checkPermissionMiddleware("VIEW_COAPPLICANTS"),
    getAllCoApplicantController,
    
)

export default coApplicantRouter;