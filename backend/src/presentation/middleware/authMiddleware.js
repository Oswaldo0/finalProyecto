import { verifyToken } from "../../infrastructure/security/jwt.js";

export function requireAuth(req, _res, next) {
  try {
    const authorization = req.get("Authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      const err = new Error("Autenticación requerida.");
      err.status = 401;
      throw err;
    }

    const payload = verifyToken(token);
    req.user = {
      id: Number(payload.sub),
      username: payload.username,
      rol: payload.rol,
    };

    next();
  } catch (error) {
    error.status = error.status || 401;
    next(error);
  }
}

export function requireRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      const err = new Error("Autenticación requerida.");
      err.status = 401;
      next(err);
      return;
    }

    if (!allowedRoles.includes(req.user.rol)) {
      const err = new Error("No tiene permisos para realizar esta acción.");
      err.status = 403;
      next(err);
      return;
    }

    next();
  };
}
