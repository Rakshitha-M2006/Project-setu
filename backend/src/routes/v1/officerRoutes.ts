import { Router } from "express";
import { officerController, updateOfficerStatusSchema, uploadEvidenceSchema, requestInfoSchema } from "../../controllers/officerController";
import { requireAuth, requireAnyRole } from "../../middleware/authMiddleware";
import validateRequest from "../../middleware/validate";
import { Role } from "@prisma/client";

const router = Router();

// Protect all routes with authentication and Officer / Senior Officer role check
router.use(requireAuth);
router.use(requireAnyRole(Role.OFFICER, Role.SENIOR_OFFICER, Role.ADMIN));

// 1. Dashboard Statistics
router.get("/dashboard-stats", (req, res, next) => officerController.getDashboardStats(req, res, next));

// 2. Grievance Management & Queue Listing
router.get("/grievances", (req, res, next) => officerController.getOfficerGrievances(req, res, next));
router.get("/grievances/:id", (req, res, next) => officerController.getGrievanceById(req, res, next));

// 3. Officer Actions
router.post("/grievances/:id/accept", (req, res, next) => officerController.acceptGrievance(req, res, next));
router.patch("/grievances/:id/status", validateRequest(updateOfficerStatusSchema), (req, res, next) =>
  officerController.updateStatus(req, res, next)
);
router.post("/grievances/:id/evidence", validateRequest(uploadEvidenceSchema), (req, res, next) =>
  officerController.uploadEvidence(req, res, next)
);
router.post("/grievances/:id/request-info", validateRequest(requestInfoSchema), (req, res, next) =>
  officerController.requestInfo(req, res, next)
);

// 4. Officer Profile
router.get("/profile", (req, res, next) => officerController.getProfile(req, res, next));
router.put("/profile", (req, res, next) => officerController.updateProfile(req, res, next));

export default router;
