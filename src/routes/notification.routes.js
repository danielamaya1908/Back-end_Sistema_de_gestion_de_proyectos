import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Gestión de notificaciones de usuario
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtiene todas las notificaciones del usuario
 *     description: Retorna un listado de notificaciones no leídas y recientes
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de notificaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   description: Cantidad de notificaciones no leídas
 *                   example: 3
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "60f7b9b0e6b9f3b9e4f8b9b0"
 *                       title:
 *                         type: string
 *                         example: "Nueva tarea asignada"
 *                       message:
 *                         type: string
 *                         example: "Se te ha asignado la tarea 'Diseñar interfaz'"
 *                       isRead:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-07-20T12:00:00Z"
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", verifyToken, getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marca una notificación como leída
 *     description: Actualiza el estado de una notificación específica a "leída"
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación a marcar como leída
 *     responses:
 *       200:
 *         description: Notificación marcada como leída exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Notificación marcada como leída"
 *       400:
 *         description: ID inválido o notificación ya estaba marcada como leída
 *       401:
 *         description: No autorizado (token inválido o no proporcionado)
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch("/:id/read", verifyToken, markAsRead);

export default router;
