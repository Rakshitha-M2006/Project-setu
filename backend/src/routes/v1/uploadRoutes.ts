import { Router } from "express";
import { uploadController } from "../../controllers/uploadController";
import { uploadSingle } from "../../middleware/uploadMiddleware";
import { requireAuth, requireAnyRole } from "../../middleware/authMiddleware";
import { uploadRateLimiter } from "../../middleware/rateLimitMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Secure file streaming (requires auth)
router.get("/files/:folder/:fileName", requireAuth, (req, res, next) =>
  uploadController.getSecureFile(req, res, next)
);

// Private Upload Endpoints
router.use(requireAuth);
router.use(uploadRateLimiter);

router.post("/general", uploadSingle, (req, res, next) =>
  uploadController.uploadGeneralFile(req, res, next)
);

router.post("/grievance/:id/attachment", uploadSingle, (req, res, next) =>
  uploadController.uploadGrievanceAttachment(req, res, next)
);

router.post(
  "/officer/grievance/:id/evidence",
  requireAnyRole(Role.OFFICER, Role.SENIOR_OFFICER, Role.ADMIN),
  uploadSingle,
  (req, res, next) => uploadController.uploadOfficerEvidence(req, res, next)
);

router.post("/application/:id/document", uploadSingle, (req, res, next) =>
  uploadController.uploadApplicationDocument(req, res, next)
);

router.delete("/attachments/:id", (req, res, next) =>
  uploadController.deleteAttachment(req, res, next)
);

export default router;
