import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarAnotaciones } from "../../../application/anotaciones/anotacionesUseCases.js";
import { openPrintWindow } from "../../utils/printDocument.js";

export function ImprimirAnotacionPage() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarAnotaciones()
      .then(setDocumentos)
      .catch(() => setDocumentos([]))
      .finally(() => setCargando(false));
  }, []);

  function handleImprimir(documento) {
    const body = `
      <table class="details">
        <tbody>
          <tr><td><strong>Correlativo:</strong></td><td>${documento.correlativo}</td></tr>
          <tr><td><strong>Fecha de observación:</strong></td><td>${documento.fecha || ""}</td></tr>
          <tr><td><strong>Observador:</strong></td><td>${documento.observador || ""}</td></tr>
          <tr><td><strong>Hora de inicio:</strong></td><td>${documento.horaInicio || ""}</td></tr>
          <tr><td><strong>Hora de fin:</strong></td><td>${documento.horaFin || ""}</td></tr>
          <tr><td><strong>Asignatura/grupo:</strong></td><td>${documento.asignaturaGrupo || ""}</td></tr>
          <tr><td><strong>Facultad / escuela:</strong></td><td>${documento.facultad || ""}</td></tr>
          <tr><td><strong>Horario:</strong></td><td>${documento.horario || ""}</td></tr>
          <tr><td><strong>Docente observado:</strong></td><td>${documento.docente || ""}</td></tr>
          <tr><td><strong>Aula:</strong></td><td>${documento.aula || ""}</td></tr>
          <tr><td><strong>Ciclo:</strong></td><td>${documento.ciclo || ""}</td></tr>
        </tbody>
      </table>

      <div class="section-title">Observaciones</div>
      <div class="text-block">${documento.observaciones || "Sin observaciones registradas."}</div>

      <div class="signature">
        <div class="signature-line"></div>
        <div><strong>${documento.observador || "Observador"}</strong></div>
        <div>Responsable de observación de clases</div>
      </div>
    `;

    openPrintWindow({
      title: `Observación de clases ${documento.correlativo}`,
      documentTitle: "Formulario para observación de clases",
      body,
      styles: ".section-title { margin: 18px 0 8px; font-size: 12px; font-weight: bold; text-transform: uppercase; }",
    });
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-700">Imprimir anotación</h2>
            <p className="mt-1 text-sm text-slate-500">
              Aquí se listan las observaciones de clases registradas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/anotaciones")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Volver
          </button>
        </div>

        {!cargando && documentos.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Sin documentos disponibles</p>
            <p className="mt-1 text-xs text-blue-700">
              Crea tu primera observación de clases para verla aquí.
            </p>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Correlativo</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Observador</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Asignatura/grupo</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Facultad</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Horario</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-sm text-slate-500">
                    Cargando anotaciones...
                  </td>
                </tr>
              ) : documentos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-sm text-slate-500">
                    No hay anotaciones para mostrar.
                  </td>
                </tr>
              ) : (
                documentos.map((documento) => (
                  <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.fecha}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.observador}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.asignaturaGrupo}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.facultad}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.horario}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleImprimir(documento)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "0.95rem" }}>
                          print
                        </span>
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
