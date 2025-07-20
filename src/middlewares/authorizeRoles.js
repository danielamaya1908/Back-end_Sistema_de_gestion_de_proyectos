export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase();

    if (!allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: rol insuficiente" });
    }

    next();
  };
}
