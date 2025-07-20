import {
  createProjectService,
  deleteProjectService,
  getAllProjectsService,
  getProjectByIdService,
  updateProjectService,
} from "../services/project.service.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

export const getAllProjects = async (req, res) => {
  try {
    const result = await getAllProjectsService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener proyectos",
      error: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.body; // Cambiado de req.query a req.body
    const project = await getProjectByIdService(projectId);

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener proyecto", error });
  }
};

export const createProject = async (req, res) => {
  try {
    const newProject = await createProjectService(req.body);
    res.status(201).json({ message: "Proyecto creado", project: newProject });
  } catch (error) {
    res.status(400).json({ message: "Error al crear proyecto", error });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Se requiere el ID del proyecto" });
    }

    const updated = await updateProjectService(id, updateData);
    res.status(200).json({ message: "Proyecto actualizado", project: updated });
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar proyecto", error });
  }
};

export const deleteProject = [
  verifyToken,
  authorizeRoles("admin", "manager"), // Solo roles autorizados
  async (req, res) => {
    try {
      const { projectId, deleteType = "soft" } = req.body;

      if (!projectId) throw new Error("projectId es requerido");
      if (!["soft", "hard"].includes(deleteType)) {
        throw new Error('deleteType debe ser "soft" o "hard"');
      }

      const result = await deleteProjectService(projectId, deleteType);
      res.status(200).json({
        success: true,
        message: `Proyecto eliminado (${result.method} delete)`,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
];
