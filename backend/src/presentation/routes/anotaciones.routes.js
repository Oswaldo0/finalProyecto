import { Router } from "express";
import * as service from "../../application/anotaciones/anotacionService.js";
import { requireRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/catalogos", async (_req, res, next) => {
  try {
    res.json(await service.obtenerCatalogos());
  } catch (err) {
    next(err);
  }
});

router.put("/catalogos", requireRoles("ADMIN"), async (req, res, next) => {
  try {
    res.json(await service.guardarCatalogos(req.body));
  } catch (err) {
    next(err);
  }
});

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
    res.json(await service.obtener(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

router.post("/", requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR"), async (req, res, next) => {
  try {
    const anotacion = await service.crear(req.body, req.user);
    res.status(201).json(anotacion);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/imprimir", requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR"), async (req, res, next) => {
  try {
    res.json(await service.marcarImpresa(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR"), async (req, res, next) => {
  try {
    res.json(await service.actualizar(Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireRoles("ADMIN"), async (req, res, next) => {
  try {
    await service.eliminar(Number(req.params.id));
    res.json({ message: "Anotación eliminada." });
  } catch (err) {
    next(err);
  }
});

export default router;
