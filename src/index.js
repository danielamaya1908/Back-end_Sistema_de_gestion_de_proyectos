import express from "express";
import { createServer } from "http"; // 👈 Importa createServer
import { Server } from "socket.io"; // 👈 Importa Server de socket.io
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import metricsRoutes from "./routes/metrics.routes.js"; // Asegúrate de importar las rutas de métricas

dotenv.config();

const app = express();

// Crear servidor HTTP (para WebSocket)
const httpServer = createServer(app); // 👈 Envuelve tu app Express

// Configurar Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite cualquier origen (ajusta en producción)
    methods: ["GET", "POST"],
  },
});

// Eventos de WebSocket
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);

  // Unir al usuario a una sala privada (por su ID de usuario)
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
    console.log(`👤 Usuario ${userId} unido a su sala de notificaciones`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/metrics", metricsRoutes); // Rutas de métricas
app.use("/api/tasks", taskRoutes);
app.use("/api", dashboardRoutes);

// Ruta raíz
app.get("/", (_, res) => {
  res.json({ msg: "API de gestión de proyectos con WebSocket 🚀" });
});

// Middleware de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

// Conexión a MongoDB y inicio del servidor
connectDB()
  .then(() => {
    console.log("🟢 MongoDB conectado");

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      // 👈 Usa httpServer en lugar de app.listen()
      console.log(`🚀 Servidor HTTP/WebSocket en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("🔴 Error en MongoDB:", err.message);
    process.exit(1);
  });

// Exporta io para usarlo en otros archivos (ej: services)
export { io }; // 👈 Exporta la instancia de Socket.io
