import express from "express";
import "dotenv/config";
import authRouter from "./routes/auth.routes.js";
import usuariosRouter from "./routes/usuarios.routes.js";
import penalidadesRouter from "./routes/penalidades.routes.js";
import estudiantesRouter from "./routes/estudiantes.routes.js";
import carrerasRouter from "./routes/carreras.routes.js";
import retiroCicloRouter from "./routes/retiroCiclo.routes.js";
import equivalenciasRouter from "./routes/equivalencias.routes.js";
import absorcionesRouter from "./routes/absorciones.routes.js";
import informesRouter from "./routes/informes.routes.js";
import { closeDatabasePool } from "../infrastructure/database/mysqlPool.js";
import { auditMutations } from "./middleware/auditMiddleware.js";
import { requireAuth, requireRoles } from "./middleware/authMiddleware.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS básico para desarrollo
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
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
app.use("/api/informes", requireAuth, requireRoles("ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"), informesRouter);

// Manejador global de errores
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Error interno del servidor." });
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
