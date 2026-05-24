import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarEquivalencias } from "../../../application/equivalencias/equivalenciasUseCases.js";

export function ImprimirEquivalenciaPage() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCargando(true);
        const result = await listarEquivalencias({ page: 1, limit: 50 });
        if (mounted) {
          setDocumentos(result.data ?? []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "No se pudieron cargar las equivalencias.");
        }
      } finally {
        if (mounted) setCargando(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function formatFecha(value) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("es-SV");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-700">Imprimir equivalencia</h2>
            <p className="mt-1 text-sm text-slate-500">
              Aquí se listarán las solicitudes de equivalencia generadas para su impresión.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/equivalencias")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Volver
          </button>
        </div>

        {cargando && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Cargando equivalencias...
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-800">Error al cargar datos</p>
            <p className="mt-1 text-xs text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Correlativo</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Alumno</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Carrera destino</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Decisión</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {!cargando && documentos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500">
                    No hay solicitudes de equivalencia para mostrar.
                  </td>
                </tr>
              ) : (
                documentos.map((documento) => (
                  <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{formatFecha(documento.fecha_solicitud)}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.alumno_nombre}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.carrera_destino || "-"}</td>
                    <td className="border-t border-slate-200 px-4 py-3">-</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                        Imprimir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}