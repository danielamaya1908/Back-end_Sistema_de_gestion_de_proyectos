import { io } from "../index.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";

// Notifica a un usuario y guarda la notificación en base de datos
export const notifyUser = async (userId, data) => {
  io.to(userId).emit("notification", {
    ...data,
    timestamp: new Date(),
  });

  await Notification.create({
    userId,
    ...data,
  });
};

// Notifica al manager y a todos los developers de un proyecto
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

// Notifica a todos los usuarios con rol "admin"
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
