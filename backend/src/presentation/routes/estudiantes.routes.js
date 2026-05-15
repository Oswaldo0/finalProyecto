import { Router } from "express";
import { buscar } from "../../infrastructure/repositories/estudianteRepository.js";

const router = Router();

router.get("/buscar", async (req, res, next) => {
  try {
    const { q = "" } = req.query;
    const estudiantes = await buscar(q);
    res.json(estudiantes);
  } catch (err) {
    next(err);
  }
});

export default router;
