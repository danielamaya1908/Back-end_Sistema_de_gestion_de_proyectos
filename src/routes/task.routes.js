import express from "express";
import {
  createTask,
  getProjectTasks,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestión de tareas de proyectos
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crear una nueva tarea
 *     description: Crea una nueva tarea asociada a un proyecto (Requiere rol admin, manager o developer)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Datos de entrada inválidos
 *       403:
 *         description: No tiene permisos para esta acción
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtener todas las tareas
 *     description: Retorna un listado paginado de todas las tareas
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Listado de tareas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 tasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  createTask
);
router.get("/getAll", verifyToken, getAllTasks);

/**
 * @swagger
 * /api/tasks/project/{projectId}:
 *   get:
 *     summary: Obtener tareas de un proyecto específico
 *     description: Retorna todas las tareas asociadas a un proyecto
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *         description: Filtrar por estado de la tarea
 *     responses:
 *       200:
 *         description: Listado de tareas del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: Proyecto no encontrado
 */
router.get("/get-by-project", verifyToken, getProjectTasks);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   get:
 *     summary: Obtener detalles de una tarea
 *     description: Retorna los detalles completos de una tarea específica
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Detalles de la tarea
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tarea no encontrada
 */
router.get("/getById", verifyToken, getTaskById);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   put:
 *     summary: Actualizar una tarea
 *     description: Actualiza los datos de una tarea existente (Requiere rol admin, manager o developer)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       403:
 *         description: No tiene permisos para esta acción
 *       404:
 *         description: Tarea no encontrada
 */
router.put(
  "/put",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  updateTask
);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   delete:
 *     summary: Eliminar una tarea
 *     description: Elimina permanentemente una tarea (Requiere rol admin o manager)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea a eliminar
 *     responses:
 *       204:
 *         description: Tarea eliminada exitosamente
 *       403:
 *         description: No tiene permisos para esta acción
 *       404:
 *         description: Tarea no encontrada
 */
router.delete(
  "/delete",
  verifyToken,
  authorizeRoles("admin", "manager"),
  deleteTask
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7b9b0e6b9f3b9e4f8b9b0"
 *         title:
 *           type: string
 *           example: "Implementar módulo de autenticación"
 *         description:
 *           type: string
 *           example: "Desarrollar el sistema de login con JWT"
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *           example: "in-progress"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           example: "2023-12-31T00:00:00Z"
 *         projectId:
 *           type: string
 *           example: "60f7b9b0e6b9f3b9e4f8b9b1"
 *         assignedTo:
 *           type: string
 *           example: "60f7b9b0e6b9f3b9e4f8b9b2"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *         - projectId
 *       properties:
 *         title:
 *           type: string
 *           example: "Nueva tarea"
 *         description:
 *           type: string
 *           example: "Descripción detallada de la tarea"
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *           default: "pending"
 *         dueDate:
 *           type: string
 *           format: date-time
 *         projectId:
 *           type: string
 *         assignedTo:
 *           type: string
 */

export default router;
