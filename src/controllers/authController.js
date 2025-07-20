import {
  registerUserService,
  loginUserService,
  getProfileService,
  refreshTokenService,
  resetPasswordService,
  requestPasswordResetService,
  verifyResetCodeService,
} from "../services/auth.service.js";
import { User } from "../models/User.js";

import { validationResult } from "express-validator";

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const result = await registerUserService(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const result = await loginUserService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const result = await refreshTokenService(req.body.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await getProfileService(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Código incorrecto." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
    return res.status(200).json({ message: "Cuenta verificada exitosamente." });
  } catch (error) {
    return res.status(500).json({ message: "Error al verificar la cuenta." });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordResetService(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const result = await verifyResetCodeService(email, code);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const result = await resetPasswordService(email, code, newPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
