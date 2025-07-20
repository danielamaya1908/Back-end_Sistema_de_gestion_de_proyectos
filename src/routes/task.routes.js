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

// Todas las rutas usan POST y reciben IDs por body
router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  createTask
);
router.get("/getAll", verifyToken, getAllTasks); // Obtener tareas de proyecto
router.get("/get-by-project", verifyToken, getProjectTasks); // Obtener tareas de proyecto
router.get("/getById", verifyToken, getTaskById); // Obtener una tarea específica
router.put(
  "/put",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  updateTask
);
router.delete(
  "/delete",
  verifyToken,
  authorizeRoles("admin", "manager"),
  deleteTask
);

export default router;
