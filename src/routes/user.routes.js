// routes/user.routes.js
import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.get(
  "/getAll",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  getAllUsers
);
router.get(
  "/getById",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  getUserById
);
router.post(
  "/create",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  createUser
);
router.put("/put", verifyToken, authorizeRoles("Admin", "Manager"), updateUser);
router.delete(
  "/delete",
  verifyToken,
  authorizeRoles("Admin", "Manager"),
  deleteUser
);

export default router;
