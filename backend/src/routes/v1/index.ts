import { Router, Request, Response } from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import citizenRoutes from "./citizenRoutes";
import officerRoutes from "./officerRoutes";
import grievanceRoutes from "./grievanceRoutes";
import serviceRoutes from "./serviceRoutes";
import notificationRoutes from "./notificationRoutes";
import departmentRoutes from "./departmentRoutes";
import slaRoutes from "./slaRoutes";
import uploadRoutes from "./uploadRoutes";
import adminRoutes from "./adminRoutes";
import analyticsRoutes from "./analyticsRoutes";
import { requireAuth, requireRole, requireAnyRole } from "../../middleware/authMiddleware";
import { ApiResponse } from "../../utils/apiResponse";
import { Role } from "@prisma/client";

const router = Router();

// Health Diagnostics
router.use("/", healthRoutes);

// Authentication & Identity
router.use("/auth", authRoutes);

// Citizen Portal Endpoints
router.use("/citizen", citizenRoutes);

// Field Officer Portal Endpoints
router.use("/officer", officerRoutes);

// Super Administrator Endpoints
router.use("/admin", adminRoutes);

// Cross-Platform Analytics & Intelligence
router.use("/analytics", analyticsRoutes);

// Grievances Endpoints
router.use("/grievances", grievanceRoutes);

// SLA Management & Escalations
router.use("/sla", slaRoutes);

// Secure Document & Evidence Uploads
router.use("/uploads", uploadRoutes);

// Public Services Endpoints
router.use("/services", serviceRoutes);

// Notifications Endpoints
router.use("/notifications", notificationRoutes);

// Department & Geography Endpoints
router.use("/departments", departmentRoutes);

// RBAC Test Endpoints (for verifying role guards)
const rbacTestRouter = Router();
rbacTestRouter.use(requireAuth);

rbacTestRouter.get("/citizen-only", requireRole(Role.CITIZEN), (req: Request, res: Response) => {
  ApiResponse.success(res, { user: (req as any).user }, "Access granted to Citizen area");
});

rbacTestRouter.get("/officer-only", requireAnyRole(Role.OFFICER, Role.SENIOR_OFFICER), (req: Request, res: Response) => {
  ApiResponse.success(res, { user: (req as any).user }, "Access granted to Officer area");
});

rbacTestRouter.get("/admin-only", requireRole(Role.ADMIN), (req: Request, res: Response) => {
  ApiResponse.success(res, { user: (req as any).user }, "Access granted to Admin area");
});

router.use("/test/rbac", rbacTestRouter);

export default router;
