// middlewares/role.middleware.js
export const checkRole = (rolesAllowed) => {
  return (req, res, next) => {
    if (!rolesAllowed.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Acceso denegado: rol insuficiente" });
    }
    next();
  };
};
