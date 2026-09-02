import { Router } from "express";
import healthRoutes from "./healthRoutes";

const router = Router();

// Health & System Diagnostic Endpoints
router.use("/", healthRoutes);

export default router;
