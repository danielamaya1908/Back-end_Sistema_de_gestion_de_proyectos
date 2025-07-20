import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const taskSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    projectId: { type: String, ref: "Project", required: true },
    assignedTo: { type: String, ref: "User", required: true },
    estimatedHours: { type: Number },
    actualHours: { type: Number, default: 0 },
    dueDate: { type: Date },
    createdBy: { type: String, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false,
  }
);

export const Task = mongoose.model("Task", taskSchema);
