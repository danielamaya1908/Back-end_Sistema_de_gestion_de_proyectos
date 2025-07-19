import jwt from "jsonwebtoken"; // asegúrate de importar bien esto

export const verifyToken = (req, res, next) => {
  const token = req.headers["session_token"];

  if (!token) {
    return res.status(401).json({ message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // asegúrate de que JWT_SECRET está definido
    req.user = decoded; // contiene { id, email, ... } según lo que firmaste
    next();
  } catch (error) {
    console.error("Error al verificar token:", error.message); // imprime el error exacto
    return res.status(401).json({ message: "Token inválido" });
  }
};
