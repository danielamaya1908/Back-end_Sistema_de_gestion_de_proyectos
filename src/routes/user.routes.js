import { Router } from "express";

const router = Router();

// Ejemplo de endpoint de usuario
router.get("/", (req, res) => {
  res.json({ msg: "Lista de usuarios" });
});

export default router;
