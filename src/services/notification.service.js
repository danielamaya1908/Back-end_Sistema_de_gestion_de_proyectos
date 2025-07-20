import { io } from "../index.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

/**
 * Notificar a un usuario y guardar en DB
 * @param {string} userId - ID del destinatario
 * @param {object} data - { type, message, relatedTask?, relatedProject? }
 */
export const notifyUser = async (userId, data) => {
  // Enviar por WebSocket
  io.to(userId).emit("notification", {
    ...data,
    timestamp: new Date(),
  });

  // Persistir en DB
  await Notification.create({
    userId,
    ...data,
  });

  console.log(`📬 Notificación enviada a ${userId}:`, data.message);
};

/**
 * Notificar a todos los miembros de un proyecto (incluye manager)
 * @param {string} projectId - ID del proyecto
 * @param {object} data - Datos de la notificación
 */
export const notifyProjectTeam = async (projectId, data) => {
  const project = await Project.findById(projectId).populate("developersIds");
  const teamIds = [
    project.managerId,
    ...project.developersIds.map((dev) => dev._id),
  ];

  await Notification.insertMany(teamIds.map((userId) => ({ userId, ...data })));

  teamIds.forEach((userId) => {
    io.to(userId).emit("notification", {
      ...data,
      timestamp: new Date(),
    });
  });
};

/**
 * Notificar a todos los admins (para alertas críticas)
 * @param {object} data - Datos de la notificación
 */
export const notifyAdmins = async (data) => {
  const admins = await User.find({ role: "admin" }).select("_id");
  const adminIds = admins.map((admin) => admin._id);

  await Notification.insertMany(
    adminIds.map((userId) => ({ userId, ...data }))
  );

  adminIds.forEach((userId) => {
    io.to(userId).emit("notification", {
      ...data,
      timestamp: new Date(),
    });
  });
};
