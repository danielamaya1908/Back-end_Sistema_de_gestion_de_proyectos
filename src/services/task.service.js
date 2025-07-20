import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { notifyUser, notifyProjectTeam } from "./notification.service.js";

/**
 * Obtiene todas las tareas con filtros basados en el modelo y paginación
 */
export const getAllTasksService = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    priority,
    assignedTo,
    projectId,
    createdBy,
    estimatedHoursMin,
    estimatedHoursMax,
    actualHoursMin,
    actualHoursMax,
    dueDateStart,
    dueDateEnd,
  } = filters;

  const skip = (page - 1) * limit;
  const query = { isDeleted: { $ne: true } }; // Filtro para soft delete

  // 🔍 Búsqueda por título o descripción (insensible a mayúsculas)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Filtros exactos (según campos del modelo)
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (projectId) query.projectId = projectId;
  if (createdBy) query.createdBy = createdBy;

  // 🔢 Filtros por rango de horas estimadas
  if (estimatedHoursMin || estimatedHoursMax) {
    query.estimatedHours = {};
    if (estimatedHoursMin)
      query.estimatedHours.$gte = Number(estimatedHoursMin);
    if (estimatedHoursMax)
      query.estimatedHours.$lte = Number(estimatedHoursMax);
  }

  // 🔢 Filtros por rango de horas reales
  if (actualHoursMin || actualHoursMax) {
    query.actualHours = {};
    if (actualHoursMin) query.actualHours.$gte = Number(actualHoursMin);
    if (actualHoursMax) query.actualHours.$lte = Number(actualHoursMax);
  }

  // 📅 Filtros por fecha límite (dueDate)
  if (dueDateStart || dueDateEnd) {
    query.dueDate = {};
    if (dueDateStart) query.dueDate.$gte = new Date(dueDateStart);
    if (dueDateEnd) query.dueDate.$lte = new Date(dueDateEnd);
  }

  // 🧭 Ordenamiento (por defecto: createdAt descendente)
  const sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // ⚡ Consulta eficiente con Promise.all
  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "name email") // Populate del usuario asignado
      .populate("createdBy", "name email") // Populate del creador
      .populate("projectId", "name"), // Populate del proyecto
    Task.countDocuments(query),
  ]);

  return {
    data: tasks,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Obtiene todas las tareas de un proyecto (con validación de existencia del proyecto)
 */
export const getTasksByProjectService = async (projectId) => {
  const projectExists = await Project.findById(projectId);
  if (!projectExists) throw new Error("Proyecto no encontrado");

  return await Task.find({
    projectId,
    isDeleted: { $ne: true }, // Filtro para soft delete
  });
};

/**
 * Obtiene una tarea específica por ID (con validación de existencia)
 */
export const getTaskByIdService = async (taskId) => {
  const task = await Task.findOne({
    _id: taskId,
    isDeleted: { $ne: true },
  });

  if (!task) throw new Error("Tarea no encontrada");
  return task;
};

/**
 * Crea una nueva tarea con validaciones:
 * 1. Proyecto existe
 * 2. Usuario asignado existe
 * 3. Campos obligatorios
 */
export const createTaskService = async (projectId, taskData, createdBy) => {
  // Validar proyecto
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Proyecto no encontrado");

  // Validar usuario asignado
  const assignedUser = await User.findById(taskData.assignedTo);
  if (!assignedUser) throw new Error("Usuario asignado no encontrado");

  // Validar fechas
  if (taskData.dueDate && new Date(taskData.dueDate) < new Date()) {
    throw new Error("La fecha límite no puede ser en el pasado");
  }

  return await Task.create({
    ...taskData,
    projectId,
    createdBy,
    status: "todo", // Valor por defecto
    actualHours: 0, // Valor por defecto
  });
};

/**
 * Actualiza una tarea existente (con validación de existencia)
 */
export const updateTaskService = async (taskId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Tarea no encontrada");

  // Evitar actualización de campos protegidos
  const protectedFields = ["_id", "projectId", "createdBy"];
  protectedFields.forEach((field) => delete updates[field]);

  Object.assign(task, updates);
  await task.save();
  return task;
};

export const deleteTaskService = async (taskId, deleteType = "soft") => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Tarea no encontrada");

  if (deleteType === "hard") {
    await Task.findByIdAndDelete(taskId); // Hard delete (borrado físico)
    return { deleted: true, method: "hard" };
  } else {
    task.isDeleted = true; // Soft delete (marcado como eliminado)
    await task.save();
    return { deleted: true, method: "soft" };
  }
};

export const assignTaskService = async (taskId, assignedTo) => {
  const task = await Task.findByIdAndUpdate(
    taskId,
    { assignedTo },
    { new: true }
  ).populate("assignedTo", "name");

  // Notificar al developer
  await notifyUser(assignedTo, {
    type: "TASK_ASSIGNED",
    message: `Tienes una nueva tarea: "${task.title}"`,
    relatedTask: task._id,
    relatedProject: task.projectId,
  });

  return task;
};

export const updateTaskStatusService = async (taskId, newStatus) => {
  const task = await Task.findById(taskId);
  const oldStatus = task.status;

  task.status = newStatus;
  await task.save();

  // Notificar al developer y al manager
  await notifyProjectTeam(task.projectId, {
    type: "TASK_UPDATED",
    message: `Tarea "${task.title}" cambió de ${oldStatus} a ${newStatus}`,
    relatedTask: task._id,
    metadata: { oldStatus, newStatus },
  });

  return task;
};
