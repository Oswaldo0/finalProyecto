import { Router } from "express";
import * as auditoriaService from "../../application/auditoria/auditoriaService.js";
import * as service from "../../application/usuarios/usuarioService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await service.listar({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/auditoria", async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await auditoriaService.listar({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const usuario = await service.crear(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const usuario = await service.actualizar(Number(req.params.id), req.body);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/password", async (req, res, next) => {
  try {
    const result = await service.cambiarPassword(Number(req.params.id), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
