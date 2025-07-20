import jwt from "jsonwebtoken";

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
    return res.status(401).json({ message: "Token inválido" });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();

    if (!allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: rol insuficiente" });
    }

    next();
  };
};

export default {
  verifyToken,
  authorizeRoles,
};
