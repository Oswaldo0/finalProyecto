import express from "express";
import "dotenv/config";
import {
  checkDatabaseConnectionUseCase,
  closeDatabasePoolUseCase,
} from "../application/system/systemUseCases.js";
import {
  buildStudentReportUseCase,
  createStudentUseCase,
  deleteStudentUseCase,
  getEditableStudent,
  getStudentOptions,
  listStudents,
  updateStudentUseCase,
} from "../application/students/studentUseCases.js";
import {
  createUserUseCase,
  getUserOptions,
  listUsers,
} from "../application/users/userUseCases.js";
import { listWeeklyScheduleUseCase } from "../application/schedules/scheduleUseCases.js";
import {
  createGroupUseCase,
  getGroupFormOptions,
  listGroups,
} from "../application/groups/groupUseCases.js";
import {
  createCatedraticUseCase,
  getCatedraticOptions,
  listCatedraticos,
} from "../application/catedraticos/catedraticUseCases.js";
import {
  createHorarioUseCase,
  getHorarioFormOptionsUseCase,
  listHorariosUseCase,
} from "../application/horarios/horarioUseCases.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const result = await checkDatabaseConnectionUseCase();
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
    const result = await listStudents(limit);
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
    const options = await getStudentOptions();
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
    const created = await createStudentUseCase(req.body || {});
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
    const student = await getEditableStudent(req.params.expediente);
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
    const updated = await updateStudentUseCase(req.params.expediente, req.body || {});
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

app.delete("/api/estudiantes/:expediente", async (req, res) => {
  try {
    const deleted = await deleteStudentUseCase(req.params.expediente);
    res.json({ status: "ok", student: deleted, message: "Estudiante inactivado correctamente." });
  } catch (error) {
    if (error.message === "Estudiante no encontrado.") {
      res.status(404).json({ status: "error", message: error.message });
      return;
    }

    if (error.message === "El estudiante ya está inactivo.") {
      res.status(409).json({ status: "error", message: error.message });
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
    const result = await buildStudentReportUseCase(req.params.expediente);
    if (!result) {
      res.status(404).json({ status: "error", message: "Estudiante no encontrado." });
      return;
    }

    const { student, pdf } = result;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="reporte-${student.expediente}.pdf"`);
    pdf.pipe(res);
    pdf.end();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.get("/api/usuarios/form-options", async (_req, res) => {
  try {
    const options = await getUserOptions();
    res.json(options);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/usuarios", async (req, res) => {
  try {
    const limit = Number(req.query.limit || 50);
    const result = await listUsers(limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/usuarios", async (req, res) => {
  try {
    const user = await createUserUseCase(req.body || {});
    res.status(201).json({ status: "ok", user });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const isDuplicateUser = error.message.includes("USERNAME");
      const isDuplicateEmail = error.message.includes("CORREO");
      const msg = isDuplicateUser
        ? "El nombre de usuario ya existe."
        : isDuplicateEmail
          ? "El correo ya está registrado."
          : "Ya existe un registro duplicado.";
      res.status(409).json({ status: "error", message: msg });
      return;
    }
    res.status(400).json({ status: "error", message: error.message });
  }
});

app.get("/api/horarios/semana", async (_req, res) => {
  try {
    const result = await listWeeklyScheduleUseCase();
    res.json({ status: "ok", ...result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/grupos/opciones-formulario", async (_req, res) => {
  try {
    const options = await getGroupFormOptions();
    res.json({ status: "ok", ...options });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/grupos", async (req, res) => {
  try {
    const result = await createGroupUseCase(req.body);
    res.status(201).json({ status: "ok", ...result });
  } catch (error) {
    if (error.message.includes("ya existe")) {
      res.status(409).json({ status: "error", message: error.message });
      return;
    }
    res.status(400).json({ status: "error", message: error.message });
  }
});

app.get("/api/grupos", async (_req, res) => {
  try {
    const groups = await listGroups();
    res.json({ status: "ok", groups });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/catedraticos/form-options", async (_req, res) => {
  try {
    const options = await getCatedraticOptions();
    res.json({ status: "ok", ...options });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/catedraticos", async (req, res) => {
  try {
    const result = await createCatedraticUseCase(req.body);
    res.status(201).json({ status: "ok", catedratic: result, message: result.message });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY" || error.message.includes("Ya existe")) {
      res.status(409).json({ status: "error", message: error.message });
      return;
    }
    res.status(400).json({ status: "error", message: error.message });
  }
});

app.get("/api/catedraticos", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await listCatedraticos(limit);
    res.json({ status: "ok", ...result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/horarios/form-options", async (_req, res) => {
  try {
    const options = await getHorarioFormOptionsUseCase();
    res.json({ status: "ok", ...options });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/api/horarios", async (req, res) => {
  try {
    const result = await createHorarioUseCase(req.body);
    res.status(201).json({ status: "ok", ...result });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

app.get("/api/horarios", async (_req, res) => {
  try {
    const rows = await listHorariosUseCase();
    res.json({ status: "ok", horarios: rows });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

const server = app.listen(port, async () => {
  console.log(`Backend escuchando en puerto ${port}`);

  try {
    const result = await checkDatabaseConnectionUseCase();
    console.log(`Conectado a ${result.database} en ${result.server}`);
  } catch (error) {
    console.warn(`No se pudo conectar a la base de datos: ${error.message}`);
  }
});

async function shutdown() {
  await closeDatabasePoolUseCase();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
