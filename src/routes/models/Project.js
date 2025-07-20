import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const projectSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["planning", "in_progress", "completed", "cancelled"],
      default: "planning",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    managerId: { type: String, ref: "User" },
    developersIds: [{ type: String, ref: "User" }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false,
  }
);

export const Project = mongoose.model("Project", projectSchema);
