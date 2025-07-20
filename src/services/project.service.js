import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { notifyProjectTeam, notifyAdmins } from "./notification.service.js";

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

  // 🔍 Búsqueda por nombre o descripción (insensible a mayúsculas)
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // ✅ Filtros exactos
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (managerId) query.managerId = managerId;
  if (developerId) query.developersIds = { $in: [developerId] };

  // 📅 Filtros por rango de fechas
  if (startDate) query.startDate = { $gte: new Date(startDate) };
  if (endDate) query.endDate = { $lte: new Date(endDate) };

  // 🧭 Ordenamiento (por defecto: createdAt descendente)
  const sortOption = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // ⚡ Consulta eficiente con Promise.all
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

export const getProjectByIdService = async (projectId) => {
  const project = await Project.findById(projectId);
  return project;
};

export const createProjectService = async (data) => {
  const newProject = new Project(data);
  return await newProject.save();
};

export const updateProjectService = async (id, updateFields) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new Error("Proyecto no encontrado");
  }

  Object.assign(project, updateFields);
  await project.save();

  return project;
};

export const deleteProjectService = async (projectId, deleteType = "soft") => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Proyecto no encontrado");

  if (deleteType === "hard") {
    // Hard delete: Elimina el proyecto y sus tareas asociadas
    await Promise.all([
      Project.findByIdAndDelete(projectId),
      Task.deleteMany({ projectId }), // 👈 Elimina todas las tareas del proyecto
    ]);
    return { method: "hard" };
  } else {
    // Soft delete: Marca el proyecto como eliminado
    project.isDeleted = true;
    await project.save();
    return { method: "soft" };
  }
};

export const updateProjectDeadline = async (projectId, newEndDate) => {
  const project = await Project.findByIdAndUpdate(
    projectId,
    { endDate: newEndDate },
    { new: true }
  );

  // Notificar al equipo del proyecto
  await notifyProjectTeam(projectId, {
    type: "PROJECT_UPDATED",
    message: `La fecha límite del proyecto se actualizó a ${
      newEndDate.toISOString().split("T")[0]
    }`,
    relatedProject: projectId,
  });

  // Alertar a admins si la fecha es crítica (ej: menos de 3 días)
  if (newEndDate - new Date() < 3 * 24 * 60 * 60 * 1000) {
    await notifyAdmins({
      type: "SYSTEM_ALERT",
      message: `⚠️ Proyecto "${project.name}" tiene menos de 3 días para finalizar`,
      relatedProject: projectId,
    });
  }

  return project;
};
