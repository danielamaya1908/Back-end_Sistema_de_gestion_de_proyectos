import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Panel de control administrativo
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Acceso al panel de control
 *     description: Solo disponible para usuarios con roles admin, manager o developer
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Token JWT
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Acceso concedido al dashboard
 *         content:
 *           application/json:
 *             example:
 *               message: "Hola [Nombre], bienvenido al panel de control"
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       403:
 *         description: Prohibido (rol no autorizado)
 *     securitySchemes:
 *       bearerAuth:
 *         type: http
 *         scheme: bearer
 *         bearerFormat: JWT
 */
router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  (req, res) => {
    res.json({
      message: `Hola ${req.user.name}, bienvenido al panel de control`,
    });
  }
);

export default router;
