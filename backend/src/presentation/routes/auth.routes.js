import { Router } from "express";
import * as service from "../../application/auth/authService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const session = await service.login(req.body);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const usuario = await service.me(req.user.id);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

export default router;
