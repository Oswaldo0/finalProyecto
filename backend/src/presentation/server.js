import express from "express";
import "dotenv/config";
import { checkDatabaseConnection, closeDatabasePool } from "../infrastructure/database/mysql.js";
import {
  createStudent,
  getEditableStudentByExpediente,
  getStudentByExpediente,
  getStudentFormOptions,
  getStudentsWithSchema,
  updateStudent,
} from "../infrastructure/repositories/studentRepository.js";
import { buildStudentReportPdf } from "../application/reports/studentReportPdf.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const result = await checkDatabaseConnection();
    res.json({ status: "ok", database: result });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/api/estudiantes", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const result = await getStudentsWithSchema(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/api/estudiantes/form-options", async (_req, res) => {
  try {
    const options = await getStudentFormOptions();
    res.json(options);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.post("/api/estudiantes", async (req, res) => {
  try {
    const created = await createStudent(req.body || {});
    res.status(201).json({ status: "ok", student: created });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(409).json({ status: "error", message: "El expediente ya existe." });
      return;
    }

    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/api/estudiantes/:expediente/edicion", async (req, res) => {
  try {
    const student = await getEditableStudentByExpediente(req.params.expediente);
    if (!student) {
      res.status(404).json({ status: "error", message: "Estudiante no encontrado." });
      return;
    }

    res.json({ status: "ok", student });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.put("/api/estudiantes/:expediente", async (req, res) => {
  try {
    const updated = await updateStudent(req.params.expediente, req.body || {});
    res.json({ status: "ok", student: updated });
  } catch (error) {
    if (error.message === "Estudiante no encontrado.") {
      res.status(404).json({ status: "error", message: error.message });
      return;
    }

    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/api/estudiantes/:expediente/reporte", async (req, res) => {
  try {
    const student = await getStudentByExpediente(req.params.expediente);

    if (!student) {
      res.status(404).json({ status: "error", message: "Estudiante no encontrado." });
      return;
    }

    const pdf = buildStudentReportPdf(student);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="reporte-${student.expediente}.pdf"`);
    pdf.pipe(res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

const server = app.listen(port, async () => {
  console.log(`Backend escuchando en puerto ${port}`);

  try {
    const result = await checkDatabaseConnection();
    console.log(`Conectado a ${result.database} en ${result.server}`);
  } catch (error) {
    console.warn(`No se pudo conectar a la base de datos: ${error.message}`);
  }
});

async function shutdown() {
  await closeDatabasePool();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
