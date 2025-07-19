import { Router } from "express";

const router = Router();

// Ejemplo de endpoint de tareas
router.get("/", (req, res) => {
  res.json({ msg: "Lista de tareas" });
});

export default router;
