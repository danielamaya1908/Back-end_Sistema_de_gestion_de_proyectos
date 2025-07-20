import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  refreshToken,
  verifyUser,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController.js";
import {
  validateLogin,
  validateRegister,
} from "../validators/auth.validator.js";
import { handleValidationErrors } from "../middlewares/validationResult.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

router.post("/login", validateLogin, handleValidationErrors, loginUser);

router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  registerUser
);

router.post("/refresh-token", refreshToken);

router.get("/profile", verifyToken, getProfile);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verificar cuenta de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - verificationCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               verificationCode:
 *                 type: string
 *                 example: "ABC123"
 *     responses:
 *       200:
 *         description: Usuario verificado exitosamente
 *       400:
 *         description: Código inválido o expirado
 */
router.post("/verify", verifyUser);

/**
 * @swagger
 * /api/auth/password/reset-request:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Código de verificación enviado
 */
router.post("/password/reset-request", requestPasswordReset);

/**
 * @swagger
 * /api/auth/password/verify-code:
 *   post:
 *     summary: Verificar código de restablecimiento
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Código verificado correctamente
 *       400:
 *         description: Código inválido o expirado
 */
router.post("/password/verify-code", verifyResetCode);

/**
 * @swagger
 * /api/auth/password/reset:
 *   post:
 *     summary: Restablecer contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: "nuevaClave123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *       400:
 *         description: Error al restablecer la contraseña
 */
router.post("/password/reset", resetPassword);

export default router;
