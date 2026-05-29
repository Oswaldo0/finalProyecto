import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarAbsorciones, obtenerAbsorcion } from "../../../application/absorciones/absorcionesUseCases.js";
import logoUrl from "../../../assets/images/LOGO_USO.png";

export function ImprimirAbsorcionPage() {
  const navigate = useNavigate();
  const [absorciones, setAbsorciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listarAbsorciones({ limit: 100 })
      .then((res) => setAbsorciones(res.data ?? []))
      .catch(() => setError("No se pudo cargar la lista de absorciones."))
      .finally(() => setCargando(false));
  }, []);

  async function handleImprimir(id) {
    try {
      const abs = await obtenerAbsorcion(id);
      const fullLogoUrl = window.location.origin + logoUrl;

      const absorbidasHtml = (abs.absorbidas ?? [])
        .map(
          (item, index) =>
            `<tr><td style="padding: 4px 8px;">${index + 1}</td><td style="padding: 4px 8px;">${item.asignatura_cursada}</td><td style="padding: 4px 8px;">${item.asignatura_absorbida}</td><td style="padding: 4px 8px;">${item.nota_asignada != null ? item.nota_asignada : ""}</td></tr>`,
        )
        .join("");

      const noExistentesHtml = (abs.noExistentes ?? [])
        .map(
          (item, index) =>
            `<tr><td style="padding: 4px 8px;">${index + 1}</td><td style="padding: 4px 8px;">${item.asignatura_nombre}</td><td style="padding: 4px 8px;">${item.nota != null ? item.nota : ""}</td></tr>`,
        )
        .join("");

      const reprobadasHtml = (abs.reprobadas ?? [])
        .map(
          (item, index) =>
            `<tr><td style="padding: 4px 8px;">${index + 1}</td><td style="padding: 4px 8px;">${item.asignatura_nombre}</td><td style="padding: 4px 8px;">${item.nota != null ? item.nota : ""}</td></tr>`,
        )
        .join("");

      const ventana = window.open("", "_blank", "width=900,height=900");
      ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Dictamen de absorción ${abs.correlativo}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Georgia, serif; color: #111; padding: 24px; }
            .header { display: flex; align-items: center; justify-content: center; padding: 20px 0; }
            .header img { height: 72px; }
            .title { text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
            .details { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; }
            .details td { padding: 6px 4px; vertical-align: top; }
            .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
            .table th, .table td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
            .table th { background: #f3f4f6; }
            .text-block { text-align: justify; line-height: 1.7; margin-bottom: 12px; }
            .signature { margin-top: 50px; }
            .signature-line { width: 260px; border-top: 1px solid #333; margin-bottom: 6px; }
            .footer { margin-top: 40px; font-size: 10px; color: #555; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header"><img src="${fullLogoUrl}" alt="Logo USO" /></div>
          <div class="title">Dictamen de absorción</div>
          <table class="details">
            <tr><td><strong>Correlativo:</strong></td><td>${abs.correlativo}</td></tr>
            <tr><td><strong>Fecha:</strong></td><td>${abs.fecha ?? ""}</td></tr>
            <tr><td><strong>Facultad:</strong></td><td>${abs.facultad_nombre}</td></tr>
            <tr><td><strong>Ciclo:</strong></td><td>${abs.ciclo}</td></tr>
            <tr><td><strong>Alumno:</strong></td><td>${abs.alumno_nombres} ${abs.alumno_apellidos}</td></tr>
            <tr><td><strong>Carrera origen:</strong></td><td>${abs.carrera_origen}</td></tr>
            <tr><td><strong>Plan de origen:</strong></td><td>${abs.plan_origen}</td></tr>
            <tr><td><strong>Plan solicitado:</strong></td><td>${abs.plan_solicitado}</td></tr>
          </table>
          <div class="text-block">${abs.encabezado_dictamen}</div>
          ${absorbidasHtml ? `<div><h3>Asignaturas absorbidas</h3><table class="table"><thead><tr><th>#</th><th>Asignatura cursada</th><th>Asignatura absorbida</th><th>Nota</th></tr></thead><tbody>${absorbidasHtml}</tbody></table></div>` : ""}
          ${noExistentesHtml ? `<div><h3>Pierde por no existir en plan solicitado</h3><table class="table"><thead><tr><th>#</th><th>Asignatura</th><th>Nota</th></tr></thead><tbody>${noExistentesHtml}</tbody></table></div>` : ""}
          ${reprobadasHtml ? `<div><h3>Asignaturas cursadas, reprobadas y absorbidas</h3><table class="table"><thead><tr><th>#</th><th>Asignatura</th><th>Nota</th></tr></thead><tbody>${reprobadasHtml}</tbody></table></div>` : ""}
          <div class="signature">
            <div class="signature-line"></div>
            <div><strong>${abs.decano_nombre}</strong></div>
            <div>${abs.facultad_firma_nombre}</div>
          </div>
          <div class="footer">Impreso desde el sistema de gestión académica.</div>
        </body>
        </html>
      `);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => ventana.print(), 400);
    } catch {
      alert("No se pudo cargar el documento de absorción.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-700">Imprimir absorción</h2>
            <p className="mt-1 text-sm text-slate-500">
              Aquí se listarán los dictámenes de absorción generados para su impresión.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/absorciones")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Volver
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">{error || (cargando ? "Cargando documentos..." : absorciones.length ? "Seleccione un dictamen para imprimir." : "No hay dictámenes de absorción para mostrar.")}</p>
          <p className="mt-1 text-xs text-blue-700">
            {cargando
              ? "Espere mientras se carga la información desde el servidor."
              : "Use el botón Imprimir para generar una vista de impresión con los datos guardados."}
          </p>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Correlativo</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Alumno</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Carrera origen</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Plan solicitado</th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">Acción</th>
              </tr>
            </thead>
            <tbody>
              {absorciones.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500">
                    {cargando ? "Cargando..." : "No hay dictámenes de absorción para mostrar."}
                  </td>
                </tr>
              ) : (
                absorciones.map((documento) => (
                  <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.fecha ? documento.fecha.slice(0, 10) : ""}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.alumno_nombre}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.carrera_origen}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.plan_solicitado}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleImprimir(documento.id)}
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
