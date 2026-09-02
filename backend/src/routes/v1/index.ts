import { Router, Request, Response } from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import { requireAuth, requireRole, requireAnyRole } from "../../middleware/authMiddleware";
import { ApiResponse } from "../../utils/apiResponse";
import { Role } from "@prisma/client";

const router = Router();

// Health Diagnostics
router.use("/", healthRoutes);

// Authentication & Identity
router.use("/auth", authRoutes);

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
