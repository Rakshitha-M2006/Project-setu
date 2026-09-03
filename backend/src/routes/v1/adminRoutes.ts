import { Router } from "express";
import { adminController } from "../../controllers/adminController";
import { requireAuth, requireRole } from "../../middleware/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Strict Admin-Only Guard
router.use(requireAuth);
router.use(requireRole(Role.ADMIN));

router.get("/dashboard-stats", (req, res, next) => adminController.getDashboardStats(req, res, next));
router.get("/users", (req, res, next) => adminController.getUsers(req, res, next));
router.patch("/users/:id/status", (req, res, next) => adminController.toggleUserStatus(req, res, next));
router.get("/officers", (req, res, next) => adminController.getOfficers(req, res, next));
router.post("/departments", (req, res, next) => adminController.createDepartment(req, res, next));
router.put("/departments/:id", (req, res, next) => adminController.updateDepartment(req, res, next));
router.get("/categories", (req, res, next) => adminController.getCategories(req, res, next));
router.post("/categories", (req, res, next) => adminController.createCategory(req, res, next));
router.get("/grievances", (req, res, next) => adminController.getGrievances(req, res, next));
router.get("/audit-logs", (req, res, next) => adminController.getAuditLogs(req, res, next));
router.get("/ai-monitoring", (req, res, next) => adminController.getAiMonitoring(req, res, next));

export default router;
