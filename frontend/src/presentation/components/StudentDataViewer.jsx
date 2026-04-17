import { useEffect, useState } from "react";
import { listStudents } from "../../application/students/studentUseCases.js";

export function StudentDataViewer({
  refreshToken = 0,
  selectedExpediente = "",
  onSelectStudent,
}) {
  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        setLoading(true);
        setError("");

        const result = await listStudents(25);
        if (!cancelled) {
          setData({ columns: result.columns || [], rows: result.rows || [] });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const displayColumns = [...data.columns];

  function formatColumnLabel(column) {
    const normalized = String(column || "").toLowerCase();

    if (normalized === "year_ingreso") return "FECHA DE INGRESO";
    if (normalized === "plan_estudio") return "PLAN DE ESTUDIO";

    return String(column || "").replaceAll("_", " ").toUpperCase();
  }

  function handleOpenSelectedReport() {
    if (!selectedExpediente) return;

    window.open(
      `/api/estudiantes/${selectedExpediente}/reporte`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Datos de estudiantes
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {selectedExpediente
              ? `Expediente seleccionado: ${selectedExpediente}`
              : "Seleccione una fila para habilitar el reporte."}
          </p>
        </div>

        <button
          type="button"
          disabled={!selectedExpediente}
          onClick={handleOpenSelectedReport}
          className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
            selectedExpediente
              ? "bg-slate-900 text-white hover:bg-slate-700"
              : "cursor-not-allowed bg-slate-200 text-slate-500"
          }`}
        >
          Visualizar reporte seleccionado
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          Cargando estudiantes...
        </div>
      ) : error ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                {displayColumns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700"
                  >
                    {formatColumnLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(displayColumns.length, 1)}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No hay registros en la tabla estudiante.
                  </td>
                </tr>
              ) : (
                data.rows.map((row, index) => (
                  <tr
                    key={`${row.expediente || "row"}-${index}`}
                    className={`cursor-pointer odd:bg-white even:bg-slate-50 ${
                      selectedExpediente && row.expediente === selectedExpediente
                        ? "bg-blue-100"
                        : ""
                    }`}
                    onClick={() => onSelectStudent?.(row.expediente)}
                  >
                    {data.columns.map((column) => (
                      <td
                        key={`${index}-${column}`}
                        className="border-t border-slate-200 px-3 py-2 align-top text-slate-700"
                      >
                        {row[column] === null ? "NULL" : String(row[column])}
                      </td>
                    ))}
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
