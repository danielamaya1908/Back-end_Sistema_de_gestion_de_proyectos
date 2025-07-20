import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
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
    relatedTask: { type: String, ref: "Task" },
    relatedProject: { type: String, ref: "Project" },
    isRead: { type: Boolean, default: false },
    metadata: { type: Object },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
