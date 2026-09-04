import { Router } from "express";
import * as service from "../../application/absorciones/absorcionService.js";
import { requireRoles } from "../middleware/authMiddleware.js";

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
    const absorcion = await service.obtener(Number(req.params.id));
    res.json(absorcion);
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

router.patch("/:id/imprimir", requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR"), async (req, res, next) => {
  try {
    const absorcion = await service.marcarImpresa(Number(req.params.id));
    res.json(absorcion);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR"), async (req, res, next) => {
  try {
    const absorcion = await service.crear(req.body);
    res.status(201).json(absorcion);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR"), async (req, res, next) => {
  try {
    const absorcion = await service.actualizar(Number(req.params.id), req.body);
    res.json(absorcion);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRoles("ADMIN"), async (req, res, next) => {
  try {
    await service.eliminar(Number(req.params.id));
    res.json({ message: "Absorción eliminada." });
  } catch (err) {
    next(err);
  }
});

export default router;
