import { Router } from "express";
import healthRoutes from "./healthRoutes";
import authRoutes from "./authRoutes";
import grievanceRoutes from "./grievanceRoutes";
import departmentRoutes from "./departmentRoutes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/grievances", grievanceRoutes);
router.use("/departments", departmentRoutes);

export default router;
