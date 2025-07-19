// src/validators/auth.validator.js
import { body } from "express-validator";

export const validateLogin = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
];

export const validateRegister = [
  body("name").notEmpty().withMessage("El nombre de usuario es requerido"),
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Contraseña mínima de 6 caracteres"),
];
