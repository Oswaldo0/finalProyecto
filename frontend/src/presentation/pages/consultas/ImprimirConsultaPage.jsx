import { useEffect, useRef, useState } from "react";
import {
  listarConsultas,
  marcarConsultaImpresa,
  obtenerConsulta,
} from "../../../application/consultas/consultasUseCases.js";
import logoUrl from "../../../assets/images/LOGO_USO.png";
import { openPrintWindow } from "../../utils/printDocument.js";
import { PreviewModal, PrintButton, PrintTable, PrintWindow, StatusBadge } from "../../components/shared/PrintWindow.jsx";

function DocumentoConsulta({ doc }) {
  return (
    <div className="mx-auto max-w-2xl bg-white px-12 py-10 font-serif text-[12px] leading-relaxed text-slate-950">
      <div className="mb-5 flex justify-center">
        <img src={logoUrl} alt="Logo USO" className="h-[72px] w-auto" />
      </div>

      <h1 className="mb-4 text-center text-base font-bold uppercase tracking-wide">
        Registro de atencion de consulta estudiantil
      </h1>

      <div className="mb-2 flex justify-between text-xs">
        <span className="font-bold uppercase tracking-widest">CONSULTA</span>
        <span className="font-semibold">{doc.correlativo}</span>
      </div>
      <div className="mb-4 border-b border-slate-500" />

      <table className="mb-4 w-full text-xs" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <InfoRow label="FECHA:" value={doc.fechaConsulta} />
          <InfoRow label="TIPO:" value={doc.tipoConsulta} />
          <InfoRow label="CICLO:" value={doc.ciclo} />
          <InfoRow label="CARRERA:" value={doc.carrera} />
          <InfoRow label="MATERIA:" value={doc.materia} />
          <InfoRow label="ESTUDIANTE:" value={`${doc.alumnoNombres} ${doc.alumnoApellidos}`} />
          <InfoRow label="COORDINADOR:" value={`${doc.coordinadorNombres} ${doc.coordinadorApellidos}`} />
        </tbody>
      </table>

      <div className="mb-4 border-b border-slate-500" />

      <section className="mb-4">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wide">Consulta presentada</h2>
        <p className="text-justify">{doc.consulta}</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wide">Respuesta brindada</h2>
        <p className="text-justify">{doc.respuesta}</p>
      </section>

      <div className="mt-12 text-xs">
        <div className="mb-1 w-64 border-t border-slate-700" />
        <p className="font-bold">{doc.coordinadorNombres} {doc.coordinadorApellidos}</p>
        <p>Coordinacion academica</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <tr>
      <td className="w-28 py-1 align-top font-bold">{label}</td>
      <td className="py-1">{value}</td>
    </tr>
  );
}

export function ImprimirConsultaPage() {
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [docSeleccionado, setDocSeleccionado] = useState(null);
  const [cargandoDoc, setCargandoDoc] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    listarConsultas({ limit: 100 })
      .then(setConsultas)
      .catch(() => setConsultas([]))
      .finally(() => setCargando(false));
  }, []);

  async function handleImprimir(id) {
    setCargandoDoc(true);
    try {
      const consulta = await obtenerConsulta(id);
      setDocSeleccionado({
        id: consulta.id,
        correlativo: consulta.correlativo,
        tipoConsulta: consulta.tipoConsulta ?? "",
        coordinadorNombres: consulta.coordinadorNombres ?? "",
        coordinadorApellidos: consulta.coordinadorApellidos ?? "",
        alumnoNombres: consulta.alumnoNombres ?? "",
        alumnoApellidos: consulta.alumnoApellidos ?? "",
        fechaConsulta: consulta.fechaConsulta ? consulta.fechaConsulta.slice(0, 10) : "",
        ciclo: consulta.ciclo ?? "",
        carrera: consulta.carrera ?? "",
        materia: consulta.materia ?? "SIN ASIGNAR",
        consulta: consulta.consulta ?? "",
        respuesta: consulta.respuesta ?? "",
        estado: consulta.estado,
      });
    } catch {
      alert("No se pudo cargar el documento de consulta.");
    } finally {
      setCargandoDoc(false);
    }
  }

  async function ejecutarImpresion() {
    if (!docSeleccionado) return;

    const d = docSeleccionado;
    openPrintWindow({
      title: `Consulta ${d.correlativo}`,
      documentTitle: "Registro de atencion de consulta estudiantil",
      styles: `
        body { font-size: 12px; line-height: 1.65; }
        .doc-header-row { display: flex; justify-content: space-between; font-weight: bold; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
        hr { border: none; border-top: 1px solid #555; margin-bottom: 16px; }
        .campo { display: table; width: 100%; margin-bottom: 4px; font-size: 12px; }
        .campo-label { display: table-cell; width: 110px; font-weight: bold; vertical-align: top; }
        .campo-valor { display: table-cell; vertical-align: top; }
        .section-title { margin: 16px 0 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.04em; }
        .body-text { text-align: justify; margin-bottom: 12px; }
        .signature { margin-top: 54px; font-size: 12px; }
        .signature-line { width: 260px; border-top: 1px solid #333; margin-bottom: 6px; }
        @media print { body { padding: 24px; } }
      `,
      body: `
        <div class="doc-header-row">
          <span>CONSULTA</span>
          <span>${d.correlativo}</span>
        </div>
        <hr />

        <div class="campo"><span class="campo-label">FECHA:</span><span class="campo-valor">${d.fechaConsulta}</span></div>
        <div class="campo"><span class="campo-label">TIPO:</span><span class="campo-valor">${d.tipoConsulta}</span></div>
        <div class="campo"><span class="campo-label">CICLO:</span><span class="campo-valor">${d.ciclo}</span></div>
        <div class="campo"><span class="campo-label">CARRERA:</span><span class="campo-valor">${d.carrera}</span></div>
        <div class="campo"><span class="campo-label">MATERIA:</span><span class="campo-valor">${d.materia}</span></div>
        <div class="campo"><span class="campo-label">ESTUDIANTE:</span><span class="campo-valor">${d.alumnoNombres} ${d.alumnoApellidos}</span></div>
        <div class="campo" style="margin-bottom:12px"><span class="campo-label">COORDINADOR:</span><span class="campo-valor">${d.coordinadorNombres} ${d.coordinadorApellidos}</span></div>
        <hr />

        <div class="section-title">Consulta presentada</div>
        <p class="body-text">${d.consulta}</p>

        <div class="section-title">Respuesta brindada</div>
        <p class="body-text">${d.respuesta}</p>

        <div class="signature">
          <div class="signature-line"></div>
          <div><strong>${d.coordinadorNombres} ${d.coordinadorApellidos}</strong></div>
          <div>Coordinacion academica</div>
        </div>
      `,
    });

    try {
      const impresa = await marcarConsultaImpresa(d.id);
      setConsultas((items) =>
        items.map((item) => (item.id === d.id ? { ...item, estado: impresa.estado } : item)),
      );
      setDocSeleccionado((prev) => (prev ? { ...prev, estado: impresa.estado } : prev));
    } catch {
      setConsultas((items) =>
        items.map((item) => (item.id === d.id ? { ...item, estado: "IMPRESO" } : item)),
      );
    }
  }

  return (
    <>
      <PrintWindow
        title="Imprimir consulta"
        description="Selecciona una consulta de estudiante para previsualizarla e imprimirla."
        backTo="/consultas"
        notice={
          !cargando && consultas.length === 0
            ? {
                title: "Sin documentos disponibles",
                detail: "Crea tu primera consulta para verla aqui.",
              }
            : null
        }
      >
        <PrintTable
          columns={["Correlativo", "Fecha", "Alumno", "Tipo", "Carrera", "Materia", "Estado", "Accion"]}
          loading={cargando}
          loadingText="Cargando consultas..."
          empty="No hay consultas para mostrar."
          rows={consultas}
          renderRow={(documento) => (
            <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
              <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.fechaConsulta ? documento.fechaConsulta.slice(0, 10) : ""}</td>
              <td className="border-t border-slate-200 px-4 py-3">{`${documento.alumnoNombres} ${documento.alumnoApellidos}`}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.tipoConsulta}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.carrera}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.materia}</td>
              <td className="border-t border-slate-200 px-4 py-3"><StatusBadge value={documento.estado} /></td>
              <td className="border-t border-slate-200 px-4 py-3 text-center">
                <PrintButton onClick={() => handleImprimir(documento.id)} disabled={cargandoDoc} />
              </td>
            </tr>
          )}
        />
      </PrintWindow>

      {docSeleccionado ? (
        <PreviewModal
          title={`Vista previa - ${docSeleccionado.correlativo}`}
          onPrint={ejecutarImpresion}
          onClose={() => setDocSeleccionado(null)}
        >
          <div ref={printRef} className="p-2">
            <DocumentoConsulta doc={docSeleccionado} />
          </div>
        </PreviewModal>
      ) : null}
    </>
  );
}
