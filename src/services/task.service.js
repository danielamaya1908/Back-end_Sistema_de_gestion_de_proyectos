import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { notifyUser, notifyProjectTeam } from "./notification.service.js";

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
  const query = { isDeleted: { $ne: true } };

  // Búsqueda por texto
  if (search && typeof search === "string") {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filtros básicos
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (projectId) query.projectId = projectId;
  if (createdBy) query.createdBy = createdBy;

  // Horas estimadas
  if (estimatedHoursMin || estimatedHoursMax) {
    query.estimatedHours = {};
    if (estimatedHoursMin !== undefined && estimatedHoursMin !== "")
      query.estimatedHours.$gte = Number(estimatedHoursMin);
    if (estimatedHoursMax !== undefined && estimatedHoursMax !== "")
      query.estimatedHours.$lte = Number(estimatedHoursMax);
  }

  // Horas reales
  if (actualHoursMin || actualHoursMax) {
    query.actualHours = {};
    if (actualHoursMin !== undefined && actualHoursMin !== "")
      query.actualHours.$gte = Number(actualHoursMin);
    if (actualHoursMax !== undefined && actualHoursMax !== "")
      query.actualHours.$lte = Number(actualHoursMax);
  }

  // Fecha de entrega
  if (dueDateStart || dueDateEnd) {
    query.dueDate = {};
    if (dueDateStart) query.dueDate.$gte = new Date(dueDateStart);
    if (dueDateEnd) query.dueDate.$lte = new Date(dueDateEnd);
  }

  const sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("projectId", "name"),
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

export const getTasksByProjectService = async (projectId) => {
  const projectExists = await Project.findById(projectId);
  if (!projectExists) throw new Error("Proyecto no encontrado");

  return await Task.find({
    projectId,
    isDeleted: { $ne: true },
  });
};

export const getTaskByIdService = async (taskId) => {
  const task = await Task.findOne({
    _id: taskId,
    isDeleted: { $ne: true },
  });

  if (!task) throw new Error("Tarea no encontrada");
  return task;
};

export const createTaskService = async (projectId, taskData, createdBy) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Proyecto no encontrado");

  const assignedUser = await User.findById(taskData.assignedTo);
  if (!assignedUser) throw new Error("Usuario asignado no encontrado");

  if (taskData.dueDate && new Date(taskData.dueDate) < new Date()) {
    throw new Error("La fecha límite no puede ser en el pasado");
  }

  return await Task.create({
    ...taskData,
    projectId,
    createdBy,
    status: "todo",
    actualHours: 0,
  });
};

export const updateTaskService = async (taskId, updates) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Tarea no encontrada");

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
    await Task.findByIdAndDelete(taskId);
    return { deleted: true, method: "hard" };
  } else {
    task.isDeleted = true;
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

  await notifyProjectTeam(task.projectId, {
    type: "TASK_UPDATED",
    message: `Tarea "${task.title}" cambió de ${oldStatus} a ${newStatus}`,
    relatedTask: task._id,
    metadata: { oldStatus, newStatus },
  });

  return task;
};
