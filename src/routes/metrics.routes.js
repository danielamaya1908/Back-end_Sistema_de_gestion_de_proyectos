import { Router } from "express";
import {
  getDashboardMetrics,
  getProjectMetrics,
} from "../controllers/metricsController.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: Métricas del sistema y proyectos
 */

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Obtiene métricas generales del dashboard
 *     description: |
 *       Requiere rol de admin, manager o developer.
 *       Devuelve estadísticas globales del sistema.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProjects:
 *                   type: integer
 *                   example: 15
 *                 activeTasks:
 *                   type: integer
 *                   example: 42
 *                 overdueTasks:
 *                   type: integer
 *                   example: 3
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       403:
 *         description: Prohibido (rol no autorizado)
 */
router.get(
  "/metrics",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  getDashboardMetrics
);

/**
 * @swagger
 * /api/metrics/project:
 *   get:
 *     summary: Obtiene métricas de un proyecto específico
 *     description: |
 *       Requiere rol de admin, manager o developer.
 *       Devuelve estadísticas detalladas del proyecto.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a consultar
 *     responses:
 *       200:
 *         description: Métricas del proyecto obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectName:
 *                   type: string
 *                   example: "Proyecto X"
 *                 completionPercentage:
 *                   type: number
 *                   format: float
 *                   example: 75.5
 *                 tasksByStatus:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: integer
 *                       example: 5
 *                     inProgress:
 *                       type: integer
 *                       example: 3
 *                     completed:
 *                       type: integer
 *                       example: 12
 *       400:
 *         description: ID de proyecto no proporcionado
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       403:
 *         description: Prohibido (rol no autorizado)
 *       404:
 *         description: Proyecto no encontrado
 */
router.get(
  "/project",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  getProjectMetrics
);

export default router;
