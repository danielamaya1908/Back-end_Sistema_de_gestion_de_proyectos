import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { notifyProjectTeam, notifyAdmins } from "./notification.service.js";

// 🔍 Obtener todos los proyectos con filtros, búsqueda, paginación y ordenamiento
export const getAllProjectsService = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    priority,
    managerId,
    developerId,
    startDate,
    endDate,
  } = filters;

  const skip = (page - 1) * limit;
  const query = {};

  // Búsqueda por nombre o descripción (insensible a mayúsculas)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Filtros exactos
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (managerId) query.managerId = managerId;
  if (developerId) query.developersIds = { $in: [developerId] };

  // Filtros por rango de fechas
  if (startDate || endDate) {
    query.startDate = {};
    if (startDate) query.startDate.$gte = new Date(startDate);
    if (endDate) query.startDate.$lte = new Date(endDate);
  }

  const sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [projects, total] = await Promise.all([
    Project.find(query).sort(sortOption).skip(skip).limit(limit),
    Project.countDocuments(query),
  ]);

  return {
    data: projects,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// 📌 Obtener proyecto por ID
export const getProjectByIdService = async (projectId) => {
  return await Project.findById(projectId);
};

// ✍️ Crear nuevo proyecto
export const createProjectService = async (data) => {
  const newProject = new Project(data);
  return await newProject.save();
};

// 🔄 Actualizar campos del proyecto
export const updateProjectService = async (id, updateFields) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Proyecto no encontrado");

  Object.assign(project, updateFields);
  await project.save();

  return project;
};

// 🗑️ Eliminar proyecto (soft o hard)
export const deleteProjectService = async (projectId, deleteType = "soft") => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Proyecto no encontrado");

  if (deleteType === "hard") {
    // Eliminación permanente del proyecto y sus tareas
    await Promise.all([
      Project.findByIdAndDelete(projectId),
      Task.deleteMany({ projectId }),
    ]);
    return { method: "hard" };
  }

  // Eliminación lógica
  project.isDeleted = true;
  await project.save();
  return { method: "soft" };
};

// 📅 Actualizar fecha límite del proyecto con notificaciones
export const updateProjectDeadline = async (projectId, newEndDate) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { endDate: newEndDate },
    { new: true }
  );

  // Notificar al equipo
  await notifyProjectTeam(projectId, {
    type: "PROJECT_UPDATED",
    message: `📅 La fecha límite se actualizó a ${
      newEndDate.toISOString().split("T")[0]
    }`,
    relatedProject: projectId,
  });

  // Notificar a administradores si queda menos de 3 días
  const daysLeft = (new Date(newEndDate) - new Date()) / (1000 * 60 * 60 * 24);
  if (daysLeft < 3) {
    await notifyAdmins({
      type: "SYSTEM_ALERT",
      message: `⚠️ Proyecto "${project.name}" tiene menos de 3 días para finalizar`,
      relatedProject: projectId,
    });
  }

  return project;
};
