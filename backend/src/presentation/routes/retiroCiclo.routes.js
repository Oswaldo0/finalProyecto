import { Router } from "express";
import * as service from "../../application/retiroCiclo/retiroCicloService.js";

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
    const retiro = await service.obtener(Number(req.params.id));
    res.json(retiro);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const retiro = await service.crear(req.body);
    res.status(201).json(retiro);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const retiro = await service.actualizar(Number(req.params.id), req.body);
    res.json(retiro);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await service.eliminar(Number(req.params.id));
    res.json({ message: "Retiro de ciclo eliminado." });
  } catch (err) {
    next(err);
  }
});

export default router;
