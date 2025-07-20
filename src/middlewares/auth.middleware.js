import jwt from "jsonwebtoken";

// Middleware de verificación de token (existente)
export const verifyToken = (req, res, next) => {
  const token = req.headers["session_token"];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error al verificar token:", error.message);
    return res.status(401).json({ message: "Token inválido" });
  }
};

// Middleware de autorización de roles (existente)
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();
    console.log("🎯 Rol del usuario normalizado:", userRole);

    if (!allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: rol insuficiente" });
    }

    next();
  };
};

// Asegúrate de exportar ambos middlewares
export default {
  verifyToken,
  authorizeRoles,
};
