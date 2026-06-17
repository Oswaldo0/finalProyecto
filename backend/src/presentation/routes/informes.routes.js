import { Router } from "express";
import * as service from "../../application/informes/informeService.js";

const router = Router();

router.get("/resumen", async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, tipoDocumento, estado } = req.query;
    const result = await service.obtenerResumen({
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      tipoDocumento: tipoDocumento || "",
      estado: estado || "",
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/opciones", async (_req, res, next) => {
  try {
    const result = await service.obtenerOpciones();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/pdf", async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, tipoDocumento, estado } = req.query;
    await service.generarPdf(
      {
        fechaDesde: fechaDesde || null,
        fechaHasta: fechaHasta || null,
        tipoDocumento: tipoDocumento || "",
        estado: estado || "",
      },
      res,
    );
  } catch (err) {
    next(err);
  }
});

export default router;
