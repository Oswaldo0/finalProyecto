import { useEffect, useState } from "react";
import {
  listarAbsorciones,
  marcarAbsorcionImpresa,
  obtenerAbsorcion,
} from "../../../application/absorciones/absorcionesUseCases.js";
import logoUrl from "../../../assets/images/LOGO_USO.png";
import { PrintButton, PrintTable, PrintWindow, StatusBadge } from "../../components/shared/PrintWindow.jsx";

export function ImprimirAbsorcionPage() {
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
      setAbsorciones((items) =>
        items.map((item) => (item.id === id ? { ...item, estado: "IMPRESO" } : item)),
      );
      marcarAbsorcionImpresa(id)
        .then((impresa) => {
          setAbsorciones((items) =>
            items.map((item) => (item.id === id ? { ...item, estado: impresa.estado } : item)),
          );
        })
        .catch(() => {});
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
    <PrintWindow
      title="Imprimir absorcion"
      description="Aqui se listan los dictamenes de absorcion generados para su impresion."
      backTo="/absorciones"
      notice={{
        tone: error ? "error" : "info",
        title: error || (cargando ? "Cargando documentos..." : absorciones.length ? "Seleccione un dictamen para imprimir." : "No hay dictamenes de absorcion para mostrar."),
        detail: cargando
          ? "Espere mientras se carga la informacion desde el servidor."
          : "Use el boton Imprimir para generar una vista de impresion con los datos guardados.",
      }}
    >
      <PrintTable
        columns={["Correlativo", "Fecha", "Alumno", "Carrera origen", "Plan solicitado", "Estado", "Accion"]}
        loading={cargando}
        loadingText="Cargando dictamenes..."
        empty="No hay dictamenes de absorcion para mostrar."
        rows={absorciones}
        renderRow={(documento) => (
          <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
            <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.fecha ? documento.fecha.slice(0, 10) : ""}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.alumno_nombre}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.carrera_origen}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.plan_solicitado}</td>
            <td className="border-t border-slate-200 px-4 py-3"><StatusBadge value={documento.estado} /></td>
            <td className="border-t border-slate-200 px-4 py-3 text-center">
              <PrintButton onClick={() => handleImprimir(documento.id)} />
            </td>
          </tr>
        )}
      />
    </PrintWindow>
  );
}
