import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true }, // Destinatario
    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "TASK_UPDATED",
        "PROJECT_UPDATED",
        "SYSTEM_ALERT",
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedTask: { type: String, ref: "Task" }, // Opcional: ID de tarea relacionada
    relatedProject: { type: String, ref: "Project" }, // Opcional: ID de proyecto
    isRead: { type: Boolean, default: false },
    metadata: { type: Object }, // Datos adicionales (ej: { oldStatus: "todo", newStatus: "in_progress" })
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
