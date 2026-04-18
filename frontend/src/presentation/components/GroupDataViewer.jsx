import { useEffect, useState } from "react";
import { listGroups } from "../../application/groups/groupUseCases.js";

export function GroupDataViewer({ refreshToken = 0 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGroups() {
      try {
        setLoading(true);
        setError("");

        const result = await listGroups();
        if (!cancelled) {
          setData(result.groups || []);
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

    loadGroups();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return (
    <div className="flex h-full min-h-[320px] flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Grupos académicos
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {data.length} grupo(s) registrado(s)
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
          Cargando grupos...
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
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  GRUPO
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  MATERIA
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  CATEDRÁTICO
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                  CICLO
                </th>
                <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-700">
                  INSCRITOS / MÁXIMO
                </th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No hay grupos creados.
                  </td>
                </tr>
              ) : (
                data.map((grupo, index) => (
                  <tr
                    key={grupo.id || index}
                    className="odd:bg-white even:bg-slate-50"
                  >
                    <td className="border-t border-slate-200 px-3 py-2 align-top font-semibold text-slate-700">
                      {grupo.nombre}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 align-top text-slate-700">
                      {grupo.materia || "N/A"}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 align-top text-slate-700">
                      {grupo.catedratico || "N/A"}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 align-top text-slate-700">
                      {grupo.ciclo || "N/A"}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-2 align-top text-center text-slate-700">
                      <span className={
                        grupo.estudiantes_inscritos >= grupo.grupo_max
                          ? "font-semibold text-red-600"
                          : "text-slate-700"
                      }>
                        {grupo.estudiantes_inscritos} / {grupo.grupo_max}
                      </span>
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
