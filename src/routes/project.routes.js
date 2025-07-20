import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Gestión de proyectos
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Obtiene todos los proyectos (Solo admin/manager)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *         description: Filtrar por estado del proyecto
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso prohibido (roles insuficientes)
 */
router.get(
  "/getAll",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getAllProjects
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obtiene un proyecto por ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Detalles del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 */
router.get(
  "/getById",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  getProjectById
);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Crea un nuevo proyecto (Solo admin/manager)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "manager"),
  createProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Actualiza un proyecto existente (Solo admin/manager)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       404:
 *         description: Proyecto no encontrado
 */
router.put(
  "/put",
  verifyToken,
  authorizeRoles("admin", "manager"),
  updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Elimina un proyecto (Solo admin/manager)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a eliminar
 *     responses:
 *       204:
 *         description: Proyecto eliminado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete(
  "/delete",
  verifyToken,
  authorizeRoles("admin", "manager"),
  deleteProject
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7b9b0e6b9f3b9e4f8b9b0"
 *         name:
 *           type: string
 *           example: "Proyecto de Desarrollo"
 *         description:
 *           type: string
 *           example: "Descripción del proyecto"
 *         status:
 *           type: string
 *           enum: [active, completed, archived]
 *           example: "active"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2023-07-20T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2023-12-31T00:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ProjectInput:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           example: "Nuevo Proyecto"
 *         description:
 *           type: string
 *           example: "Descripción del nuevo proyecto"
 *         status:
 *           type: string
 *           enum: [active, completed, archived]
 *           default: "active"
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 */

export default router;
