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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       400:
 *         description: Credenciales inválidas
 */
router.post("/login", validateLogin, handleValidationErrors, loginUser);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos de registro inválidos
 */
router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  registerUser
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refrescar token de acceso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nuevo token generado
 *       401:
 *         description: Token de refresco inválido
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil de usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 */
router.get("/profile", verifyToken, getProfile);

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

export default router;
