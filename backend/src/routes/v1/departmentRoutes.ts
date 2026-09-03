import { Router } from "express";
import { getDepartments, createDepartment } from "../../controllers/departmentController";
import { requireAuth, requireRole } from "../../middleware/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Public: list departments and problem categories
router.get("/", (req, res, next) => getDepartments(req, res, next));

// Admin: create new department
router.post("/", requireAuth, requireRole(Role.ADMIN), (req, res, next) =>
  createDepartment(req, res, next)
);

export default router;
