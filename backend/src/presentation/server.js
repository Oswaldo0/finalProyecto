import express from "express";
import "dotenv/config";
import penalidadesRouter from "./routes/penalidades.routes.js";
import estudiantesRouter from "./routes/estudiantes.routes.js";
import carrerasRouter from "./routes/carreras.routes.js";
import retiroCicloRouter from "./routes/retiroCiclo.routes.js";
import { closeDatabasePool } from "../infrastructure/database/mysqlPool.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS básico para desarrollo
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (_req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/penalidades", penalidadesRouter);
app.use("/api/estudiantes", estudiantesRouter);
app.use("/api/carreras", carrerasRouter);
app.use("/api/retiros-ciclo", retiroCicloRouter);

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
