import { Router } from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.get(
  "/getAll",
  verifyToken,
  authorizeRoles("admin", "manager"),
  getAllProjects
);

router.get(
  "/getById",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"),
  getProjectById
);

router.post(
  "/create",
  verifyToken,
  authorizeRoles("admin", "manager"),
  createProject
);

router.put(
  "/put",
  verifyToken,
  authorizeRoles("admin", "manager"),
  updateProject
);

router.delete(
  "/delete",
  verifyToken,
  authorizeRoles("admin", "manager"),
  deleteProject
);

export default router;
