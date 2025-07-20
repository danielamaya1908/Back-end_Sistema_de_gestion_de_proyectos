import {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
} from "../services/user.service.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

export const getAllUsers = async (req, res) => {
  try {
    const result = await getAllUsersService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }

    const user = await getUserByIdService(userId);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await createUserService(req.body);
    res.status(201).json({ message: "Desarrollador creado", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId, ...updates } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID de usuario requerido" });
    }

    const updatedUser = await updateUserService(userId, updates);

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = [
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { userId, deleteType = "soft" } = req.body;

      if (!userId) throw new Error("userId es requerido");
      if (!["soft", "hard"].includes(deleteType)) {
        throw new Error('deleteType debe ser "soft" o "hard"');
      }

      const result = await deleteUserService(userId, deleteType);
      res.status(200).json({
        success: true,
        message: `Usuario eliminado (${result.method} delete)`,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
];
