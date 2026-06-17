import { create } from "../../infrastructure/repositories/auditoriaRepository.js";

const ACTION_BY_METHOD = {
  POST: "CREAR",
  PUT: "ACTUALIZAR",
  PATCH: "ACTUALIZAR",
  DELETE: "ELIMINAR",
};

function getEntityFromPath(path) {
  const [, api, entity] = path.split("/");
  return api === "api" ? entity ?? null : null;
}

export function auditMutations(req, res, next) {
  const action = ACTION_BY_METHOD[req.method];
  const shouldAudit = action || req.path.endsWith("/pdf");

  if (!shouldAudit) {
    next();
    return;
  }

  res.on("finish", () => {
    if (res.statusCode >= 500) return;

    create({
      usuario_id: req.user?.id,
      username: req.user?.username,
      rol: req.user?.rol,
      metodo: req.method,
      ruta: req.originalUrl,
      accion: action ?? "IMPRIMIR",
      entidad: getEntityFromPath(req.originalUrl),
      estado_http: res.statusCode,
      ip: req.ip,
      user_agent: req.get("User-Agent"),
    }).catch((error) => {
      console.error("No se pudo registrar auditoría:", error.message);
    });
  });

  next();
}
