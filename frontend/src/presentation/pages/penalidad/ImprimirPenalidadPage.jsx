import { useNavigate } from "react-router-dom";

const DOCUMENTOS_PENALIDAD = [];

export function ImprimirPenalidadPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-700">Imprimir penalidad</h2>
            <p className="mt-1 text-sm text-slate-500">
              Aquí se listarán los documentos de penalidad generados para su impresión.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/penalidad")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Volver
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">Sin documentos disponibles</p>
          <p className="mt-1 text-xs text-blue-700">
            La tabla ya está preparada, pero todavía no aparecen registros porque aún no hay base de datos conectada.
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Correlativo</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Alumno</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Carrera</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Ciclo de reingreso</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {DOCUMENTOS_PENALIDAD.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500">
                    No hay documentos de penalidad para mostrar.
                  </td>
                </tr>
              ) : (
                DOCUMENTOS_PENALIDAD.map((documento) => (
                  <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.fecha}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.alumno}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.carrera}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.cicloReingreso}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
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