import { useEffect, useState } from "react";
import { listHorarios } from "../../application/horarios/horarioUseCases.js";

const DIAS_ORDER = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

export function HorarioDataViewer({ refreshToken = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState("Todos");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const result = await listHorarios();
        if (!cancelled) setData(result.horarios || []);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshToken]);

  const filtered =
    selectedDay === "Todos" ? data : data.filter((h) => h.dia === selectedDay);

  return (
    <div className="flex h-full min-h-[320px] flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {["Todos", ...DIAS_ORDER].map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              selectedDay === day
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-400"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          Cargando horarios...
        </div>
      ) : error ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                {["Día", "Hora inicio", "Hora fin", "Grupo", "Materia", "Aula"].map((col) => (
                  <th key={col} className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No hay horarios registrados{selectedDay !== "Todos" ? ` para ${selectedDay}` : ""}.
                  </td>
                </tr>
              ) : (
                filtered.map((h, i) => (
                  <tr key={h.id || i} className="odd:bg-white even:bg-slate-50">
                    <td className="border-t border-slate-200 px-3 py-2 font-semibold text-slate-700">{h.dia}</td>
                    <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{h.hora_inicio}</td>
                    <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{h.hora_fin}</td>
                    <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{h.grupo || "—"}</td>
                    <td className="border-t border-slate-200 px-3 py-2 text-slate-500">{h.materia || "—"}</td>
                    <td className="border-t border-slate-200 px-3 py-2 text-slate-500">{h.aula || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
