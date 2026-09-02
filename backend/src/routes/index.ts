import { Router } from "express";
import v1Routes from "./v1";

const router = Router();

// Version 1 API Routes (/api/v1)
router.use("/v1", v1Routes);

// Root API Welcome endpoint (/api)
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to PROJECT SETU Backend API",
    version: "1.0.0",
    documentation: "/docs",
    endpoints: {
      health: "/api/v1/health",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
