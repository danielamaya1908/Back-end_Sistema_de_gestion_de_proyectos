import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import path from "path";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
  });
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Gestión de Proyectos",
      version: "1.0.0",
      description: "API para gestión de proyectos con WebSocket",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(process.cwd(), "src", "routes", "*.js")],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Swagger UI route
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", dashboardRoutes);

// Root endpoint
app.get("/", (_, res) => {
  res.json({ msg: "API de gestión de proyectos con WebSocket 🚀" });
});

// Error handler
app.use((err, _, res, __) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

// Database connection and server start
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
      console.log(`📚 Swagger en http://localhost:${PORT}/api-docs`);
      // 👇 Debug: Verifica las rutas escaneadas
      console.log(
        "Rutas escaneadas:",
        path.join(process.cwd(), "src", "routes", "*.js")
      );
    });
  })
  .catch((err) => {
    console.error("Error MongoDB:", err);
    process.exit(1);
  });

export { io };
