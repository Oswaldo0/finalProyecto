import { useEffect, useState } from "react";
import {
  listarEquivalencias,
  marcarEquivalenciaImpresa,
  obtenerEquivalencia,
} from "../../../application/equivalencias/equivalenciasUseCases.js";
import logoUrl from "../../../assets/images/LOGO_USO.png";
import { PrintButton, PrintTable, PrintWindow, StatusBadge } from "../../components/shared/PrintWindow.jsx";

export function ImprimirEquivalenciaPage() {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cargandoDoc, setCargandoDoc] = useState(false);

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

  async function handleImprimir(id) {
    setCargandoDoc(true);
    try {
      const equivalencia = await obtenerEquivalencia(id);
      if (!equivalencia) {
        alert("No se encontró la equivalencia seleccionada.");
        return;
      }

      setDocumentos((items) =>
        items.map((item) => (item.id === id ? { ...item, estado: "IMPRESO" } : item)),
      );
      marcarEquivalenciaImpresa(id)
        .then((impresa) => {
          setDocumentos((items) =>
            items.map((item) => (item.id === id ? { ...item, estado: impresa.estado } : item)),
          );
        })
        .catch(() => {});

      const detallesHtml = (equivalencia.detalles ?? []).map((detalle, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${detalle.asignatura_cursada ?? ""}</td>
          <td>${detalle.uv ?? ""}</td>
          <td>${detalle.nota ?? ""}</td>
          <td>${detalle.institucion_nombre ?? ""}</td>
          <td>${detalle.asignatura_solicitada ?? ""}</td>
          <td>${detalle.resultado ?? ""}</td>
        </tr>
      `).join("");

      const fullLogoUrl = window.location.origin + logoUrl;
      const ventana = window.open("", "_blank", "width=900,height=850");
      ventana.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Solicitud de equivalencias ${equivalencia.correlativo || ""}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Times New Roman', serif; font-size: 12px; color: #111; background: #fff; padding: 32px; }
            .page { width: 100%; }
            .brand { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
            .brand img { height: 72px; }
            .brand-title { text-align: center; flex: 1; margin-left: 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; }
            .title { text-align: center; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; margin: 12px 0 20px; }
            .meta-table, .detalle-table { width: 100%; border-collapse: collapse; }
            .meta-table td { vertical-align: top; padding: 4px 6px; font-size: 12px; }
            .meta-label { width: 160px; font-weight: bold; text-transform: uppercase; }
            .detalle-table th, .detalle-table td { border: 1px solid #333; padding: 6px 8px; font-size: 11px; }
            .detalle-table th { background: #f3f4f6; text-transform: uppercase; }
            .detalle-table td { vertical-align: top; }
            .content { margin: 20px 0; text-align: justify; line-height: 1.7; text-indent: 28px; }
            .notes { margin-top: 16px; font-size: 11px; line-height: 1.6; }
            .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 40px; }
            .signature-box { text-align: center; }
            .signature-line { border-top: 1px solid #333; width: 220px; margin: 0 auto 8px; }
            .signature-title { font-size: 11px; margin-top: 4px; }
            .no-print { display: block; margin-top: 18px; }
            @media print { body { padding: 16mm; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="brand">
              <img src="${fullLogoUrl}" alt="Logo USO" />
              <div class="brand-title">
                Universidad de Sonsonate<br />Facultad de Ingeniería
              </div>
            </div>

            <div class="title">Solicitud de Equivalencias</div>

            <table class="meta-table">
              <tbody>
                <tr><td class="meta-label">Correlativo:</td><td>${equivalencia.correlativo ?? "-"}</td></tr>
                <tr><td class="meta-label">Fecha de solicitud:</td><td>${equivalencia.fecha_solicitud ? new Date(equivalencia.fecha_solicitud).toLocaleDateString("es-SV") : "-"}</td></tr>
                <tr><td class="meta-label">Alumno:</td><td>${equivalencia.alumno_nombre ?? "-"}</td></tr>
                <tr><td class="meta-label">Carreras cursadas:</td><td>${equivalencia.carreras_cursadas ?? "-"}</td></tr>
                <tr><td class="meta-label">Carrera destino:</td><td>${equivalencia.carrera_destino ?? "-"}</td></tr>
              </tbody>
            </table>

            <div class="content">${(equivalencia.texto_solicitud ?? "").replace(/\n/g, "<br/>")}</div>

            <table class="detalle-table">
              <thead>
                <tr>
                  <th class="text-center">#</th>
                  <th>Asignatura cursada</th>
                  <th class="text-center">U.V.</th>
                  <th class="text-center">Nota</th>
                  <th>Institución</th>
                  <th>Asignatura solicitada</th>
                  <th class="text-center">Resultado</th>
                </tr>
              </thead>
              <tbody>
                ${detallesHtml || `<tr><td colspan="7" style="padding: 12px; text-align: center;">No hay detalles registrados.</td></tr>`}
              </tbody>
            </table>

            <div class="notes"><strong>Notas de la universidad:</strong> ${equivalencia.notas_universidad ? equivalencia.notas_universidad : "Sin observaciones."}</div>

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-title">Firma del alumno</div>
                <div>${equivalencia.alumno_nombre_firma ?? ""}</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-title">Decano</div>
                <div>${equivalencia.decano_nombre ?? ""}</div>
                <div class="signature-title">Fecha de aprobación: ${equivalencia.fecha_decano ? new Date(equivalencia.fecha_decano).toLocaleDateString("es-SV") : "-"}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => ventana.print(), 400);
    } catch (err) {
      alert(err.message || "No se pudo cargar el documento de equivalencia.");
    } finally {
      setCargandoDoc(false);
    }
  }

  return (
    <PrintWindow
      title="Imprimir equivalencia"
      description="Aqui se listan las solicitudes de equivalencia generadas para su impresion."
      backTo="/equivalencias"
      notice={
        error
          ? { tone: "error", title: "Error al cargar datos", detail: error }
          : cargando
            ? { tone: "neutral", title: "Cargando equivalencias..." }
            : documentos.length === 0
              ? { title: "Sin documentos disponibles", detail: "No hay solicitudes de equivalencia para mostrar." }
              : null
      }
    >
      <PrintTable
        columns={["Correlativo", "Fecha", "Alumno", "Carrera destino", "Decision", "Estado", "Accion"]}
        loading={cargando}
        loadingText="Cargando equivalencias..."
        empty="No hay solicitudes de equivalencia para mostrar."
        rows={documentos}
        renderRow={(documento) => (
          <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
            <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
            <td className="border-t border-slate-200 px-4 py-3">{formatFecha(documento.fecha_solicitud)}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.alumno_nombre}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.carrera_destino || "-"}</td>
            <td className="border-t border-slate-200 px-4 py-3">-</td>
            <td className="border-t border-slate-200 px-4 py-3"><StatusBadge value={documento.estado} /></td>
            <td className="border-t border-slate-200 px-4 py-3 text-center">
              <PrintButton onClick={() => handleImprimir(documento.id)} disabled={cargandoDoc} />
            </td>
          </tr>
        )}
      />
    </PrintWindow>
  );
}
