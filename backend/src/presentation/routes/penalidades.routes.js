import { Router } from "express";
import * as service from "../../application/penalidades/penalidadService.js";

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
    const penalidad = await service.obtener(Number(req.params.id));
    res.json(penalidad);
  } catch (err) {
    next(err);
  }
});

router.get("/:id/pdf", async (req, res, next) => {
  try {
    await service.generarPdf(Number(req.params.id), res);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const penalidad = await service.crear(req.body);
    res.status(201).json(penalidad);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const penalidad = await service.actualizar(Number(req.params.id), req.body);
    res.json(penalidad);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await service.eliminar(Number(req.params.id));
    res.json({ message: "Penalidad eliminada." });
  } catch (err) {
    next(err);
  }
});

export default router;
