import express from "express";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRouter from "./routes/auth.routes.js";
import usuariosRouter from "./routes/usuarios.routes.js";
import penalidadesRouter from "./routes/penalidades.routes.js";
import estudiantesRouter from "./routes/estudiantes.routes.js";
import carrerasRouter from "./routes/carreras.routes.js";
import retiroCicloRouter from "./routes/retiroCiclo.routes.js";
import equivalenciasRouter from "./routes/equivalencias.routes.js";
import absorcionesRouter from "./routes/absorciones.routes.js";
import anotacionesRouter from "./routes/anotaciones.routes.js";
import consultasRouter from "./routes/consultas.routes.js";
import informesRouter from "./routes/informes.routes.js";
import { env, validateRuntimeEnv } from "../infrastructure/config/env.js";
import { closeDatabasePool } from "../infrastructure/database/mysqlPool.js";
import { auditMutations } from "./middleware/auditMiddleware.js";
import { requireAuth, requireRoles } from "./middleware/authMiddleware.js";

validateRuntimeEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../../frontend/dist");
const app = express();
const port = env.port;
const allowedOrigins = getAllowedOrigins();

app.disable("x-powered-by");
app.use(applySecurityHeaders);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "1mb" }));

app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ message: "Origen no permitido por CORS." });
  }

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/usuarios", requireAuth, requireRoles("ADMIN"), auditMutations, usuariosRouter);
app.use(auditMutations);
app.use("/api/penalidades", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), penalidadesRouter);
app.use("/api/estudiantes", requireAuth, estudiantesRouter);
app.use("/api/carreras", requireAuth, carrerasRouter);
app.use("/api/retiros-ciclo", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), retiroCicloRouter);
app.use("/api/equivalencias", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), equivalenciasRouter);
app.use("/api/absorciones", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), absorcionesRouter);
app.use("/api/anotaciones", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), anotacionesRouter);
app.use("/api/consultas", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), consultasRouter);
app.use("/api/informes", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), informesRouter);

if (env.isProduction) {
  app.use(express.static(frontendDistPath, {
    etag: true,
    index: false,
    maxAge: "1h",
  }));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = status >= 500 && env.isProduction
    ? "Error interno del servidor."
    : err.message || "Error interno del servidor.";
  res.status(status).json({ message });
});

const server = app.listen(port, () => {
  console.log(`Backend escuchando en puerto ${port}`);
});

async function shutdown() {
  await closeDatabasePool().catch(() => {});
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function getAllowedOrigins() {
  const configured = process.env.CORS_ORIGINS;
  const defaults = env.isProduction ? [] : [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
  ];

  return new Set(
    (configured ? configured.split(",") : defaults)
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function applySecurityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (env.isProduction) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'",
    );
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }

  next();
}
