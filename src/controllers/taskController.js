import {
  getTaskByIdService,
  getTasksByProjectService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
  getAllTasksService,
} from "../services/task.service.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

export const getAllTasks = async (req, res) => {
  try {
    // Validar que los campos de filtro sean válidos según el modelo
    const validFilters = [
      "page",
      "limit",
      "search",
      "sortBy",
      "sortOrder",
      "status",
      "priority",
      "assignedTo",
      "projectId",
      "createdBy",
      "estimatedHoursMin",
      "estimatedHoursMax",
      "actualHoursMin",
      "actualHoursMax",
      "dueDateStart",
      "dueDateEnd",
    ];

    const filteredBody = {};
    Object.keys(req.body).forEach((key) => {
      if (validFilters.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    const result = await getAllTasksService(filteredBody);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener tareas",
      error: error.message,
    });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) throw new Error("projectId es requerido");

    const tasks = await getTasksByProjectService(projectId);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (!taskId) throw new Error("taskId es requerido");

    const task = await getTaskByIdService(taskId);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createTask = [
  verifyToken, // Middleware 1: Verifica el token
  authorizeRoles("admin", "manager", "developer"), // Middleware 2: Valida roles
  async (req, res) => {
    try {
      const { projectId, ...taskData } = req.body;
      const createdBy = req.user.id; // ID del usuario autenticado

      // Validación básica de campos requeridos
      if (!projectId || !taskData.assignedTo) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      // Llamar al servicio
      const task = await createTaskService(projectId, taskData, createdBy);

      res.status(201).json({
        message: "Tarea creada exitosamente",
        task,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
];

export const updateTask = async (req, res) => {
  try {
    const { taskId, ...updates } = req.body;
    if (!taskId) throw new Error("taskId es requerido");

    const task = await updateTaskService(taskId, updates);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTask = [
  verifyToken,
  authorizeRoles("admin", "manager"), // Solo roles autorizados
  async (req, res) => {
    try {
      const { taskId, deleteType = "soft" } = req.body; // Parámetro opcional (default: "soft")

      if (!taskId) throw new Error("taskId es requerido");
      if (!["soft", "hard"].includes(deleteType)) {
        throw new Error('deleteType debe ser "soft" o "hard"');
      }

      const result = await deleteTaskService(taskId, deleteType);
      res.status(200).json({
        success: true,
        message: `Tarea eliminada (${result.method} delete)`,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
];
