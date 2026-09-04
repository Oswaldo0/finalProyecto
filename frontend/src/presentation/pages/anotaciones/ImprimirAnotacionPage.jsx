import { useEffect, useState } from "react";
import { PrintButton, PrintTable, PrintWindow, StatusBadge } from "../../components/shared/PrintWindow.jsx";
import {
  listarAnotaciones,
  marcarAnotacionImpresa,
} from "../../../application/anotaciones/anotacionesUseCases.js";

import { openPrintWindow } from "../../utils/printDocument.js";
export function ImprimirAnotacionPage() {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarAnotaciones()
      .then(setDocumentos)
      .catch(() => setDocumentos([]))
      .finally(() => setCargando(false));
  }, []);

  async function handleImprimir(documento) {
    setDocumentos((items) =>
      items.map((item) => (item.id === documento.id ? { ...item, estado: "IMPRESO" } : item)),
    );
    marcarAnotacionImpresa(documento.id)
      .then((impresa) => {
        setDocumentos((items) =>
          items.map((item) => (item.id === documento.id ? { ...item, estado: impresa.estado } : item)),
        );
      })
      .catch(() => {});

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
    <PrintWindow
      title="Imprimir anotacion"
      description="Aqui se listan las observaciones de clases registradas."
      backTo="/anotaciones"
      notice={
        !cargando && documentos.length === 0
          ? {
              title: "Sin documentos disponibles",
              detail: "Crea tu primera observacion de clases para verla aqui.",
            }
          : null
      }
    >
      <PrintTable
        columns={["Correlativo", "Fecha", "Observador", "Asignatura/grupo", "Facultad", "Horario", "Estado", "Accion"]}
        loading={cargando}
        loadingText="Cargando anotaciones..."
        empty="No hay anotaciones para mostrar."
        rows={documentos}
        renderRow={(documento) => (
          <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
            <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.fecha}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.observador}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.asignaturaGrupo}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.facultad}</td>
            <td className="border-t border-slate-200 px-4 py-3">{documento.horario}</td>
            <td className="border-t border-slate-200 px-4 py-3"><StatusBadge value={documento.estado} /></td>
            <td className="border-t border-slate-200 px-4 py-3 text-center">
              <PrintButton onClick={() => handleImprimir(documento)} />
            </td>
          </tr>
        )}
      />
    </PrintWindow>
  );
}
