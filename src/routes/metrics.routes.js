import { Router } from "express";
import {
  getDashboardMetrics,
  getProjectMetrics,
} from "../controllers/metricsController.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.get(
  "/metrics",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  getDashboardMetrics
);

router.get(
  "/project", // <- Cambiado de '/project/:projectId' a '/project'
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  getProjectMetrics
);

export default router;
