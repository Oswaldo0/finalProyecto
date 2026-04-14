import { useEffect, useState } from "react";

export function StudentDataViewer({ refreshToken = 0 }) {
  const [data, setData] = useState({ columns: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/estudiantes?limit=25");
        if (!response.ok) {
          throw new Error("No se pudieron cargar los estudiantes.");
        }

        const result = await response.json();
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

  const displayColumns = [...data.columns, "acciones"];

  return (
    <div className="flex h-full min-h-[320px] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Datos de estudiantes</h3>
          <p className="mt-1 text-sm text-slate-600">Visualizador con nombres fieles de columnas de la tabla estudiante.</p>
        </div>
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
                  <th key={column} className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(displayColumns.length, 1)} className="px-3 py-6 text-center text-slate-500">
                    No hay registros en la tabla estudiante.
                  </td>
                </tr>
              ) : (
                data.rows.map((row, index) => (
                  <tr key={`${row.expediente || "row"}-${index}`} className="odd:bg-white even:bg-slate-50">
                    {data.columns.map((column) => (
                      <td key={`${index}-${column}`} className="border-t border-slate-200 px-3 py-2 align-top text-slate-700">
                        {row[column] === null ? "NULL" : String(row[column])}
                      </td>
                    ))}
                    <td className="border-t border-slate-200 px-3 py-2 align-top text-slate-700">
                      <button
                        type="button"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                        onClick={() => window.open(`/api/estudiantes/${row.expediente}/reporte`, "_blank", "noopener,noreferrer")}
                      >
                        Visualizar reporte
                      </button>
                    </td>
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
