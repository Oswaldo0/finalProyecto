import { useEffect, useRef, useState } from "react";
import {
  listarRetirosCiclo,
  marcarRetiroCicloImpresa,
  obtenerRetiroCiclo,
} from "../../../application/retiroCiclo/retiroCicloUseCases.js";
import logoUrl from "../../../assets/images/LOGO_USO.png";
import { PreviewModal, PrintButton, PrintTable, PrintWindow, StatusBadge } from "../../components/shared/PrintWindow.jsx";

function DocumentoRetiroCiclo({ doc }) {
  return (
    <div className="mx-auto max-w-2xl bg-white font-serif text-slate-900" style={{ overflow: "hidden" }}>
      <div style={{ padding: "20px 0 10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <img src={logoUrl} alt="Logo USO" style={{ height: "80px" }} />
      </div>

      <div style={{ padding: "10px 56px 40px" }}>
        <h1 style={{ textAlign: "center", fontSize: "13px", fontWeight: "bold", textDecoration: "underline", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
          Resolución
        </h1>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "22px", fontSize: "12px" }}>
          <tbody>
            {[
              ["EXPEDIENTE:", doc.expediente],
              ["NOMBRE:", doc.alumnoNombre],
              ["CARNET:", doc.carnet],
              ["CARRERA:", doc.carreraNombre],
              ["FECHA:", doc.fecha],
            ].map(([label, value]) => (
              <tr key={label}>
                <td style={{ width: "130px", fontWeight: "bold", paddingBottom: "5px", verticalAlign: "top" }}>{label}</td>
                <td style={{ paddingLeft: "60px", paddingBottom: "5px", verticalAlign: "top" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{ textAlign: "justify", fontSize: "12px", lineHeight: "1.85", marginBottom: "14px", textIndent: "40px" }}>
          {doc.textoResolucion}
        </p>

        <div style={{ marginBottom: "14px", paddingLeft: "24px" }}>
          {doc.asignaturas.map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "3px 0", lineHeight: "1.7" }}>
              <span style={{ display: "flex", gap: "12px" }}>
                <span style={{ minWidth: "20px" }}>{i + 1})</span>
                <span>{a.nombre}</span>
              </span>
              <span style={{ marginRight: "70px" }}>{a.uv != null ? Number(a.uv).toFixed(1) : ""}</span>
            </div>
          ))}
        </div>

        {doc.observacionFinal && (
          <p style={{ textAlign: "justify", fontSize: "12px", lineHeight: "1.7", marginBottom: "0" }}>
            {doc.observacionFinal}
          </p>
        )}

        <div style={{ height: "120px" }} />

        <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
          <div style={{ borderTop: "1px solid #333", width: "240px", marginBottom: "5px" }} />
          <p style={{ fontWeight: "bold" }}>{doc.decanoNombre}</p>
          <p>Decano de la Facultad de Ingeniería y Ciencias Naturales</p>
        </div>
      </div>
    </div>
  );
}

export function ImprimirRetiroCicloPage() {
  const [retiros, setRetiros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [docSeleccionado, setDocSeleccionado] = useState(null);
  const [cargandoDoc, setCargandoDoc] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    listarRetirosCiclo({ limit: 100 })
      .then((res) => setRetiros(res.data ?? []))
      .catch(() => setRetiros([]))
      .finally(() => setCargando(false));
  }, []);

  async function handleImprimir(id) {
    setCargandoDoc(true);
    try {
      const ret = await obtenerRetiroCiclo(id);
      const retiroImpreso = await marcarRetiroCicloImpresa(id);
      setRetiros((items) =>
        items.map((item) =>
          item.id === id ? { ...item, estado: retiroImpreso.estado ?? "IMPRESO" } : item,
        ),
      );
      setDocSeleccionado({
        id: ret.id,
        correlativo: ret.correlativo,
        expediente: ret.expediente ?? "",
        carnet: ret.carnet ?? "",
        fecha: ret.fecha ? ret.fecha.slice(0, 10) : "",
        alumnoNombre: ret.alumno_nombre ?? "",
        carreraNombre: ret.carrera_nombre ?? "",
        cicloRetirar: ret.ciclo_a_retirar ?? "",
        articuloReferencia: ret.articulo_referencia ?? "",
        textoResolucion: ret.texto_resolucion ?? "",
        observacionFinal: ret.observacion_final ?? "",
        decanoNombre: ret.decano_nombre ?? "",
        facultadNombre: ret.facultad_nombre ?? "",
        estado: retiroImpreso.estado ?? "IMPRESO",
        asignaturas: (ret.asignaturas ?? []).map((a) => ({
          nombre: a.asignatura_nombre,
          uv: a.uv,
        })),
      });
    } catch {
      alert("No se pudo cargar o actualizar el documento de retiro de ciclo.");
    } finally {
      setCargandoDoc(false);
    }
  }

  function ejecutarImpresion() {
    if (!docSeleccionado) return;
    const d = docSeleccionado;
    const fullLogoUrl = window.location.origin + logoUrl;

    const asigHtml = d.asignaturas
      .map(
        (a, i) =>
          `<div class="asig-row"><span class="asig-num">${i + 1})</span><span class="asig-nombre">${a.nombre}</span><span class="asig-uv">${a.uv != null ? Number(a.uv).toFixed(1) : ""}</span></div>`,
      )
      .join("");

    const ventana = window.open("", "_blank", "width=850,height=900");
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Resolución ${d.correlativo}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: Georgia, "Times New Roman", serif;
            font-size: 12px;
            color: #111;
            background: #fff;
          }
          .doc-header {
            padding: 20px 0 10px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .doc-header img { height: 80px; }
          .doc-body { padding: 10px 56px 40px; }
          .doc-title {
            text-align: center;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            text-decoration: underline;
            margin-bottom: 20px;
          }
          .campos { margin-bottom: 22px; }
          .campo { display: flex; margin-bottom: 5px; line-height: 1.5; }
          .campo-label { width: 130px; font-weight: bold; flex-shrink: 0; }
          .campo-valor { padding-left: 60px; flex: 1; }
          .body-text {
            text-align: justify;
            margin-bottom: 14px;
            line-height: 1.85;
            text-indent: 40px;
          }
          .body-text-noi {
            text-align: justify;
            margin-bottom: 14px;
            line-height: 1.7;
          }
          .asignaturas { margin: 0 0 16px 24px; }
          .asig-row { display: flex; padding: 3px 0; line-height: 1.7; align-items: baseline; }
          .asig-num { width: 28px; flex-shrink: 0; }
          .asig-nombre { flex: 1; }
          .asig-uv { width: 60px; text-align: left; padding-left: 12px; flex-shrink: 0; }
          .firma-space { height: 120px; }
          .firma { font-size: 12px; line-height: 1.6; }
          .firma-linea { border-top: 1px solid #333; width: 240px; margin-bottom: 5px; }
          .firma-nombre { font-weight: bold; }
          .pie-pagina {
            background: #1a3a6e;
            color: #fff;
            padding: 8px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            font-family: Arial, sans-serif;
            margin-top: 40px;
          }
          @media print {
            .pie-pagina { position: fixed; bottom: 0; left: 0; right: 0; margin-top: 0; }
            body { padding-bottom: 60px; }
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <img src="${fullLogoUrl}" alt="Logo USO" />
        </div>

        <div class="doc-body">
          <div class="doc-title">Resolución</div>

          <div class="campos">
            <div class="campo"><span class="campo-label">EXPEDIENTE:</span><span class="campo-valor">${d.expediente}</span></div>
            <div class="campo"><span class="campo-label">NOMBRE:</span><span class="campo-valor">${d.alumnoNombre}</span></div>
            <div class="campo"><span class="campo-label">CARNET:</span><span class="campo-valor">${d.carnet}</span></div>
            <div class="campo"><span class="campo-label">CARRERA:</span><span class="campo-valor">${d.carreraNombre}</span></div>
            <div class="campo"><span class="campo-label">FECHA:</span><span class="campo-valor">${d.fecha}</span></div>
          </div>

          <p class="body-text">${d.textoResolucion}</p>

          <div class="asignaturas">${asigHtml}</div>

          ${d.observacionFinal ? `<p class="body-text-noi">${d.observacionFinal}</p>` : ""}

          <div class="firma-space"></div>

          <div class="firma">
            <div class="firma-linea"></div>
            <p class="firma-nombre">${d.decanoNombre}</p>
            <p>Decano de la Facultad de Ingeniería y Ciencias Naturales</p>
          </div>
        </div>

        <div class="pie-pagina">
          <span>El Boco Barreno y Avenida del Central, Final Estadio 1° de Sonsonate, Sonsonate, El Salvador, C.A. &#9632; Tel: (503) 2429-4026 &#9632; www.usonsonante.edu.sv</span>
          <span>Respondemos en camino hacia la excelencia</span>
        </div>
      </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 400);
  }

  return (
    <>
      <PrintWindow
        title="Imprimir retiro de ciclo"
        description="Selecciona un documento de retiro de ciclo para previsualizarlo e imprimirlo."
        backTo="/retiro-ciclo"
        notice={
          !cargando && retiros.length === 0
            ? {
                title: "Sin documentos disponibles",
                detail: "Crea tu primer retiro de ciclo para verlo aqui.",
              }
            : null
        }
      >
        <PrintTable
          columns={["Correlativo", "Fecha", "Expediente", "Alumno", "Ciclo a retirar", "Estado", "Accion"]}
          loading={cargando}
          loadingText="Cargando registros..."
          empty="No hay documentos de retiro de ciclo para mostrar."
          rows={retiros}
          renderRow={(r) => (
            <tr key={r.id} className="odd:bg-white even:bg-slate-50">
              <td className="border-t border-slate-200 px-4 py-3">{r.correlativo}</td>
              <td className="border-t border-slate-200 px-4 py-3">{r.fecha ? r.fecha.slice(0, 10) : ""}</td>
              <td className="border-t border-slate-200 px-4 py-3">{r.expediente}</td>
              <td className="border-t border-slate-200 px-4 py-3">{r.alumno_nombre}</td>
              <td className="border-t border-slate-200 px-4 py-3">{r.ciclo_a_retirar}</td>
              <td className="border-t border-slate-200 px-4 py-3"><StatusBadge value={r.estado} /></td>
              <td className="border-t border-slate-200 px-4 py-3 text-center">
                <PrintButton onClick={() => handleImprimir(r.id)} disabled={cargandoDoc} />
              </td>
            </tr>
          )}
        />
      </PrintWindow>

      {docSeleccionado && (
        <PreviewModal
          title={`Vista previa - ${docSeleccionado.correlativo}`}
          onPrint={ejecutarImpresion}
          onClose={() => setDocSeleccionado(null)}
        >
          <div ref={printRef} className="overflow-hidden rounded-b-xl">
            <DocumentoRetiroCiclo doc={docSeleccionado} />
            <div style={{ background: "#1a3a6e", color: "#fff", padding: "8px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "9px", fontFamily: "Arial, sans-serif" }}>
              <span>El Boco Barreno y Avenida del Central, Final Estadio 1 de Sonsonate, Sonsonate, El Salvador, C.A. - Tel: (503) 2429-4026 - www.usonsonante.edu.sv</span>
              <span>Respondemos en camino hacia la excelencia</span>
            </div>
          </div>
        </PreviewModal>
      )}
    </>
  );
}
