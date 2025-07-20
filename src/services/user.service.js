import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";

export const getAllUsersService = async (filters) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    ...restFilters
  } = filters;

  const skip = (page - 1) * limit;
  const query = {};

  if (search && typeof search === "string") {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  for (const key in restFilters) {
    if (restFilters[key] !== undefined && restFilters[key] !== "") {
      query[key] = restFilters[key];
    }
  }

  const sortOption = {};
  if (sortBy) {
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .select("-password -refreshToken"),
    User.countDocuments(query),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getUserByIdService = async (id) => {
  const user = await User.findById(id).select("-password -refreshToken");
  if (!user) throw new Error("Usuario no encontrado");
  return user;
};

export const createUserService = async (userData) => {
  const { name, email, password, avatar = "" } = userData;

  if (!name || !email || !password) {
    throw new Error("Todos los campos son requeridos");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("El correo ya está registrado");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "developer",
    avatar,
    isVerified: true,
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
};

export const updateUserService = async (id, updates) => {
  if (!updates || typeof updates !== "object") {
    throw new Error("Los datos de actualización son inválidos o faltantes");
  }

  const user = await User.findById(id);
  if (!user) throw new Error("Usuario no encontrado");

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  Object.assign(user, updates);
  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
};

export const deleteUserService = async (userId, deleteType = "soft") => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Usuario no encontrado");

  if (deleteType === "hard") {
    await Promise.all([
      User.findByIdAndDelete(userId),
      Task.deleteMany({ $or: [{ assignedTo: userId }, { createdBy: userId }] }),
      Project.updateMany(
        { $or: [{ managerId: userId }, { developersIds: userId }] },
        { $pull: { developersIds: userId } }
      ),
    ]);
    return { method: "hard" };
  } else {
    user.isDeleted = true;
    await user.save();
    return { method: "soft" };
  }
};
