import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  refreshToken,
  verifyUser,
} from "../controllers/authController.js";

import {
  validateLogin,
  validateRegister,
} from "../validators/auth.validator.js";
// routes/auth.routes.js

import { handleValidationErrors } from "../middlewares/validationResult.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas de autenticación
router.post("/login", validateLogin, handleValidationErrors, loginUser);
router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  registerUser
);
router.post("/refresh-token", refreshToken);
router.post("/verify", verifyUser);

// Ruta protegida, ahora usa 'session_token' en headers
router.get("/profile", verifyToken, getProfile);

export default router;
