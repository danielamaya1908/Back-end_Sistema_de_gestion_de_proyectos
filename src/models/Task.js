const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  phaseName: {
    type: String,
    enum: ["fase uno", "fase dos", "fase tres", "fase cuatro"],
    required: true,
  },
  phaseStatus: {
    type: String,
    enum: ["completado", "no completado"],
    default: "no completado",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

module.exports = mongoose.model("Task", TaskSchema);
sss;
