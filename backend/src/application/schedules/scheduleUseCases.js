import { getWeeklyScheduleRows } from "../../infrastructure/repositories/scheduleRepository.js";

const WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

function normalizeDay(day) {
  const text = String(day || "").trim().toLowerCase();
  if (text === "lunes") return "Lunes";
  if (text === "martes") return "Martes";
  if (text === "miercoles" || text === "miércoles") return "Miercoles";
  if (text === "jueves") return "Jueves";
  if (text === "viernes") return "Viernes";
  if (text === "sabado" || text === "sábado") return "Sabado";
  if (text === "domingo") return "Domingo";
  return null;
}

export async function listWeeklyScheduleUseCase() {
  const rows = await getWeeklyScheduleRows();

  const schedule = Object.fromEntries(WEEK_DAYS.map((day) => [day, []]));

  for (const row of rows) {
    const day = normalizeDay(row.dia);
    if (!day) continue;

    schedule[day].push({
      hora: `${row.hora_inicio} - ${row.hora_fin}`,
      grupo: row.grupo || "SIN GRUPO",
      clase: row.clase || "SIN CLASE",
      aula: row.aula || "SIN AULA",
    });
  }

  return { days: WEEK_DAYS, schedule };
}
