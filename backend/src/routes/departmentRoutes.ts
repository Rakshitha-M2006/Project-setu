import { Router } from "express";
import {
  getDepartments,
  createDepartment,
  createDepartmentSchema,
} from "../controllers/departmentController";
import { authenticateJwt } from "../middleware/authMiddleware";
import { requireRoles } from "../middleware/roleGuard";
import { validateRequest } from "../middleware/validate";

const router = Router();

router.get("/", getDepartments);

router.post(
  "/",
  authenticateJwt,
  requireRoles("ADMIN"),
  validateRequest(createDepartmentSchema),
  createDepartment
);

export default router;
