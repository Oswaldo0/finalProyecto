import { Router } from "express";
import { findActivas } from "../../infrastructure/repositories/carreraRepository.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const carreras = await findActivas();
    res.json(carreras);
  } catch (err) {
    next(err);
  }
});

export default router;
