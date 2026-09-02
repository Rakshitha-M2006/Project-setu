import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
  registerSchema,
  loginSchema,
} from "../controllers/authController";
import { authenticateJwt } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validate";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authenticateJwt, getCurrentUser);

export default router;
