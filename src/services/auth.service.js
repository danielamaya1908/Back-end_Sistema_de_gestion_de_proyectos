// services/auth.service.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
// Importación actualizada
import {
  sendWelcomeVerificationEmail,
  sendPasswordResetEmail, // 👈 Nueva función añadida
} from "../utils/sendEmail.js";

export const registerUserService = async (userData) => {
  const { name, email, password, role = "developer", avatar = "" } = userData;

  if (!name || !email || !password) {
    throw new Error("Todos los campos son requeridos");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("El correo ya está registrado");

  const hashedPassword = await bcrypt.hash(password, 10);

  // ✅ Generar código de verificación de 6 dígitos
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    avatar: avatar || undefined,
    verificationCode, // <-- Asegúrate que el modelo lo soporte
    isVerified: false, // <- también útil si quieres marcar si ya confirmó su cuenta
  });

  // 📩 Enviar correo con código de verificación
  await sendWelcomeVerificationEmail({
    to: email,
    name,
    verificationCode,
  });

  return {
    message:
      "Usuario registrado con éxito. Se ha enviado un correo de verificación.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
};

export const loginUserService = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Credenciales inválidas");
  }

  // 🚫 Bloqueo si no está verificado
  if (!user.isVerified) {
    throw new Error("Cuenta no verificada. Verifica tu correo.");
  }

  const payload = { id: user._id, role: user.role };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    message: "Login exitoso",
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) throw new Error("Refresh token requerido");

  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error("Refresh token inválido");

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return { token: newToken };
  } catch (err) {
    throw new Error("Refresh token inválido o expirado");
  }
};

export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new Error("Usuario no encontrado");
  return user;
};

// 1. Solicitar recuperación (envía código al email)
export const requestPasswordResetService = async (email) => {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) throw new Error("Usuario no encontrado");

  // Generar código de 6 dígitos (similar a verificationCode)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetCodeExpires = new Date(Date.now() + 3600000); // 1 hora de expiración

  user.passwordResetCode = resetCode;
  user.passwordResetExpires = resetCodeExpires;
  await user.save();

  // Enviar email (usa tu función existente o crea una nueva)
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetCode,
  });

  return {
    success: true,
    message: "Código de recuperación enviado al correo",
  };
};

// 2. Verificar código de recuperación
export const verifyResetCodeService = async (email, code) => {
  const user = await User.findOne({
    email,
    passwordResetCode: code,
    passwordResetExpires: { $gt: new Date() }, // Código no expirado
    isDeleted: false,
  });

  if (!user) throw new Error("Código inválido o expirado");
  return {
    success: true,
    message: "Código válido",
  };
};

// 3. Actualizar contraseña
export const resetPasswordService = async (email, code, newPassword) => {
  const user = await User.findOne({
    email,
    passwordResetCode: code,
    passwordResetExpires: { $gt: new Date() },
    isDeleted: false,
  });

  if (!user) throw new Error("Código inválido o expirado");

  // Actualizar contraseña (hash) y limpiar código
  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetCode = null;
  user.passwordResetExpires = null;
  await user.save();

  return {
    success: true,
    message: "Contraseña actualizada exitosamente",
  };
};
