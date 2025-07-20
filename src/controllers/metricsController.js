import {
  getDashboardMetricsService,
  getProjectMetricsService,
} from "../services/metrics.service.js";
import { Project } from "../models/Project.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const metrics = await getDashboardMetricsService(userId, userRole);

    const formattedResponse = {
      projectsByStatus: formatStatusData(metrics.projectsByStatus, "projects"),
      tasksByStatus: formatStatusData(metrics.tasksByStatus, "tasks"),
      tasksByPriority: formatPriorityData(metrics.tasksByPriority),
      hoursComparison: formatHoursComparison(metrics.hoursComparison[0]),
      overdueTasks: metrics.overdueTasks,
      userStats: metrics.userTasks
        ? formatUserStats(metrics.userTasks[0])
        : null,
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener métricas",
      error: error.message,
    });
  }
};

export const getProjectMetrics = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "El campo 'projectId' es requerido en el body",
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    const hasAccess = await checkProjectAccess(projectId, userId, userRole);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "No tienes acceso a este proyecto",
      });
    }

    const metrics = await getProjectMetricsService(projectId);
    res.status(200).json(metrics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener métricas del proyecto",
      error: error.message,
    });
  }
};

async function checkProjectAccess(projectId, userId, userRole) {
  if (userRole === "admin") return true;

  const project = await Project.findById(projectId);
  if (!project) return false;

  if (userRole === "manager") {
    return project.managerId.toString() === userId;
  }

  if (userRole === "developer") {
    return project.developersIds.includes(userId);
  }

  return false;
}

function formatStatusData(data, type) {
  const defaultStatuses =
    type === "projects"
      ? ["planning", "in_progress", "completed", "cancelled"]
      : ["todo", "in_progress", "review", "done"];

  const result = defaultStatuses.map((status) => ({
    status,
    count: 0,
  }));

  data.forEach((item) => {
    const found = result.find((i) => i.status === item.status);
    if (found) found.count = item.count;
  });

  return result;
}

function formatPriorityData(data) {
  const priorities = ["low", "medium", "high"];

  const result = priorities.map((priority) => ({
    priority,
    count: data.find((item) => item.priority === priority)?.count || 0,
  }));

  return result;
}

function formatHoursComparison(data) {
  if (!data) return { estimated: 0, actual: 0 };
  return {
    estimated: data.totalEstimated || 0,
    actual: data.totalActual || 0,
  };
}

function formatUserStats(data) {
  if (!data) return null;

  return {
    totalTasks: data.totalTasks || 0,
    completedTasks: data.completedTasks || 0,
    overdueTasks: data.overdueTasks || 0,
    completionRate: data.totalTasks
      ? Math.round((data.completedTasks / data.totalTasks) * 100)
      : 0,
  };
}
