// src/routes/dashboard.routes.js

import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("admin", "manager", "developer"), // <- los roles permitidos
  (req, res) => {
    res.json({
      message: `Hola ${req.user.name}, bienvenido al panel de control`,
    });
  }
);

export default router;
