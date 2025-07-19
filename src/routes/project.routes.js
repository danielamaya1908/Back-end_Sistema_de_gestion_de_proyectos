import { Router } from "express";

const router = Router();

// Ejemplo de endpoint de proyectos
router.get("/", (req, res) => {
  res.json({ msg: "Lista de proyectos" });
});

export default router;
