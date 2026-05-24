import { Router } from "express";
import * as service from "../../application/equivalencias/equivalenciaService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { page, limit, estado } = req.query;
    const result = await service.listar({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      estado,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const equivalencia = await service.obtener(Number(req.params.id));
    res.json(equivalencia);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const equivalencia = await service.crear(req.body);
    res.status(201).json(equivalencia);
  } catch (err) {
    next(err);
  }
});

export default router;