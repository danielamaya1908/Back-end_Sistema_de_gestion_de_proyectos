import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

dotenv.config();

const app = express();

// Conectar a MongoDB
connectDB()
  .then(() => {
    console.log("🟢 Conexión a MongoDB exitosa");

    // Middlewares
    app.use(cors());

    app.use(morgan("dev"));
    app.use(express.json());

    // Rutas
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/projects", projectRoutes);
    app.use("/api/tasks", taskRoutes);
    app.use("/api", dashboardRoutes); // acceso final: /api/dashboard

    // Ruta raíz
    app.get("/", (_, res) => {
      res.json({ msg: "API de gestión de proyectos 🚀" });
    });

    // Middleware de errores
    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Error interno del servidor",
      });
    });

    // Iniciar servidor
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("🔴 Error al conectar a MongoDB:", err.message);
    process.exit(1);
  });
