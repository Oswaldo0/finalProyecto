import { useEffect, useRef, useState } from "react";
import { listarPenalidades, obtenerPenalidad } from "../../../application/penalidad/penalidadUseCases.js";
import logoUrl from "../../../assets/images/LOGO_USO.png";
import { openPrintWindow } from "../../utils/printDocument.js";
import { PreviewModal, PrintButton, PrintTable, PrintWindow, StatusBadge } from "../../components/shared/PrintWindow.jsx";

function separarNombreCompleto(nombre = "") {
  const partes = String(nombre).trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) {
    return { nombres: partes[0] ?? "", apellidos: "" };
  }
  const mitad = Math.ceil(partes.length / 2);
  return {
    nombres: partes.slice(0, mitad).join(" "),
    apellidos: partes.slice(mitad).join(" "),
  };
}

function numeroEnLetras(numero) {
  const numeros = [
    "cero",
    "una",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
  ];
  return numeros[numero] ?? String(numero);
}

function totalUnidadesValorativas(asignaturas) {
  return asignaturas.reduce((total, asignatura) => total + Number(asignatura.uv || 0), 0);
}

function DocumentoPenalidad({ doc }) {
  const asignaturasEnLetras = numeroEnLetras(doc.asignaturas.length);
  const totalUv = totalUnidadesValorativas(doc.asignaturas);

  return (
    <div className="mx-auto max-w-2xl bg-white px-12 py-10 font-serif text-[12px] leading-relaxed text-slate-950">
      <div className="mb-5 flex justify-center">
        <img src={logoUrl} alt="Logo USO" className="h-[72px] w-auto" />
      </div>
      <h1 className="mb-4 text-center text-base font-bold uppercase tracking-wide">
        Memorando de penalización
      </h1>
      <div className="mb-2 flex justify-between text-xs">
        <span className="font-bold uppercase tracking-widest">MEMORANDO</span>
        <span className="font-semibold">{doc.correlativo}</span>
      </div>
      <div className="mb-4 border-b border-slate-500" />

      <table className="mb-3 w-full text-xs" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td className="w-24 py-1 align-top font-bold">PARA:</td>
            <td className="py-1">
              {doc.secretarioNombres} {doc.secretarioApellidos}<br />
              <span className="font-semibold uppercase">Secretario General</span>
            </td>
          </tr>
          <tr>
            <td className="w-24 py-1 align-top font-bold">DE:</td>
            <td className="py-1">{doc.decanoNombres} {doc.decanoApellidos}</td>
          </tr>
          <tr>
            <td className="w-24 py-1 align-top font-bold">ASUNTO:</td>
            <td className="py-1 font-semibold uppercase">
              Penalización por más de {doc.cantidadAniosEgreso} años de egreso
            </td>
          </tr>
          <tr>
            <td className="w-24 py-1 align-top font-bold">FECHA:</td>
            <td className="py-1">{doc.fecha}</td>
          </tr>
        </tbody>
      </table>
      <div className="mb-5 border-b border-slate-500" />

      <p className="mb-3 text-justify">
        Respetuosamente informo que el bachiller{" "}
        <strong>{doc.alumnoNombres} {doc.alumnoApellidos}</strong>{" "}
        ha solicitado el reingreso a la carrera de{" "}
        <strong>{doc.carrera}</strong>.
      </p>

      <p className="mb-4 text-justify">
        El bachiller egresó en <strong>{doc.mesEgreso}</strong> de{" "}
        <strong>{doc.anioEgreso}</strong>, por lo que tiene a esta fecha,{" "}
        <strong>{doc.aniosEgresado}</strong> años de haber egresado. Por tal razón, y de acuerdo
        al artículo 25 del Reglamento de Administración Académica, que en el literal a, dice que
        aquellos que tengan entre tres y cinco años de egreso, deberán cursar{" "}
        <strong>{totalUv}</strong> unidades valorativas para efectos de actualización, se dictamina
        que el bachiller debe regresar a las aulas en el presente ciclo{" "}
        <strong>{doc.cicloReingreso}</strong> a cursar las siguientes asignaturas:
      </p>

      <ol className="mb-4 list-none pl-8" style={{ listStyleType: "none" }}>
        {doc.asignaturas.map((asignatura, index) => (
          <li key={index} className="grid grid-cols-[1fr_70px] py-0.5">
            <span>{index + 1}. {asignatura.nombre}</span>
            <span className="text-right">{String(asignatura.uv).padStart(2, "0")}</span>
          </li>
        ))}
      </ol>

      <p className="mb-8 text-justify">
        Solicito se coordine con la Unidad de Tecnología Informática, para generar las condiciones
        informáticas que permitan al bachiller inscribir las {asignaturasEnLetras} asignaturas.
      </p>

      <p>Atentamente,</p>
    </div>
  );
}

export function ImprimirPenalidadPage() {
  const [penalidades, setPenalidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [docSeleccionado, setDocSeleccionado] = useState(null);
  const [cargandoDoc, setCargandoDoc] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    listarPenalidades({ limit: 100 })
      .then((res) => setPenalidades(res.data ?? []))
      .catch(() => setPenalidades([]))
      .finally(() => setCargando(false));
  }, []);

  async function handleImprimir(id) {
    setCargandoDoc(true);
    try {
      const pen = await obtenerPenalidad(id);
      const secretario = separarNombreCompleto(pen.secretario_nombre ?? "");
      const alumno = separarNombreCompleto(pen.alumno_nombre ?? "");
      const decano = separarNombreCompleto(pen.decano_nombre ?? "");

      setDocSeleccionado({
        id: pen.id,
        correlativo: pen.correlativo,
        fecha: pen.fecha ? pen.fecha.slice(0, 10) : "",
        alumno: pen.alumno_nombre,
        carrera: pen.carrera_nombre,
        cicloReingreso: pen.ciclo_reingreso,
        estado: pen.estado,
        secretarioNombres: secretario.nombres,
        secretarioApellidos: secretario.apellidos,
        decanoNombres: decano.nombres,
        decanoApellidos: decano.apellidos,
        cantidadAniosEgreso: pen.cantidad_anios_egreso,
        alumnoNombres: alumno.nombres,
        alumnoApellidos: alumno.apellidos,
        mesEgreso: pen.mes_egreso,
        anioEgreso: pen.anio_egreso,
        aniosEgresado: pen.anios_egresado,
        asignaturas: (pen.asignaturas ?? []).map((asignatura) => ({
          nombre: asignatura.asignatura_nombre,
          uv: asignatura.uv ?? 0,
        })),
      });
    } catch {
      alert("No se pudo cargar el documento de penalidad.");
    } finally {
      setCargandoDoc(false);
    }
  }

  function ejecutarImpresion() {
    if (!docSeleccionado) return;

    const d = docSeleccionado;
    const asignaturasEnLetras = numeroEnLetras(d.asignaturas.length);
    const totalUv = totalUnidadesValorativas(d.asignaturas);
    const asignaturasHtml = d.asignaturas
      .map(
        (asignatura, index) =>
          `<div class="asig-row"><span>${index + 1}. ${asignatura.nombre}</span><span class="asig-uv">${String(asignatura.uv).padStart(2, "0")}</span></div>`,
      )
      .join("");

    openPrintWindow({
      title: `Memorando ${d.correlativo}`,
      documentTitle: "Memorando de penalización",
      styles: `
          body { font-size: 12px; line-height: 1.65; }
          .memo-header { display: flex; justify-content: space-between; font-weight: bold; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
          hr { border: none; border-top: 1px solid #555; margin-bottom: 16px; }
          .campo { display: table; width: 100%; margin-bottom: 4px; font-size: 12px; }
          .campo-label { display: table-cell; width: 96px; font-weight: bold; vertical-align: top; }
          .campo-valor { display: table-cell; vertical-align: top; }
          .body-text { text-align: justify; margin-bottom: 12px; }
          .asignaturas { margin: 0 0 16px 42px; max-width: 560px; }
          .asig-row { display: grid; grid-template-columns: 1fr 70px; padding: 1px 0; }
          .asig-uv { text-align: right; }
          .atentos { margin-top: 26px; }
          @media print { body { padding: 24px; } }
      `,
      body: `
        <div class="memo-header">
          <span>MEMORANDO</span>
          <span>${d.correlativo}</span>
        </div>
        <hr />

        <div class="campo"><span class="campo-label">PARA:</span><span class="campo-valor">${d.secretarioNombres} ${d.secretarioApellidos}<br/><strong>SECRETARIO GENERAL</strong></span></div>
        <div class="campo"><span class="campo-label">DE:</span><span class="campo-valor">${d.decanoNombres} ${d.decanoApellidos}</span></div>
        <div class="campo"><span class="campo-label">ASUNTO:</span><span class="campo-valor"><strong>PENALIZACIÓN POR MÁS DE ${d.cantidadAniosEgreso} AÑOS DE EGRESO</strong></span></div>
        <div class="campo" style="margin-bottom:12px"><span class="campo-label">FECHA:</span><span class="campo-valor">${d.fecha}</span></div>
        <hr />

        <p class="body-text">
          Respetuosamente informo que el bachiller <strong>${d.alumnoNombres} ${d.alumnoApellidos}</strong> ha solicitado el reingreso a la carrera de <strong>${d.carrera}</strong>.
        </p>
        <p class="body-text">
          El bachiller egresó en <strong>${d.mesEgreso}</strong> de <strong>${d.anioEgreso}</strong>, por lo que tiene a esta fecha, <strong>${d.aniosEgresado}</strong> años de haber egresado. Por tal razón, y de acuerdo al artículo 25 del Reglamento de Administración Académica, que en el literal a, dice que aquellos que tengan entre tres y cinco años de egreso, deberán cursar <strong>${totalUv}</strong> unidades valorativas para efectos de actualización, se dictamina que el bachiller debe regresar a las aulas en el presente ciclo <strong>${d.cicloReingreso}</strong> a cursar las siguientes asignaturas:
        </p>

        <div class="asignaturas">
          ${asignaturasHtml}
        </div>

        <p class="body-text">
          Solicito se coordine con la Unidad de Tecnología Informática, para generar las condiciones informáticas que permitan al bachiller inscribir las ${asignaturasEnLetras} asignaturas.
        </p>

        <p class="atentos">Atentamente,</p>
      `,
    });
  }

  return (
    <>
      <PrintWindow
        title="Imprimir penalidad"
        description="Selecciona un documento de penalidad para previsualizarlo e imprimirlo."
        backTo="/penalidad"
        notice={
          !cargando && penalidades.length === 0
            ? {
                title: "Sin documentos disponibles",
                detail: "Crea tu primera penalidad para verla aqui.",
              }
            : null
        }
      >
        <PrintTable
          columns={["Correlativo", "Fecha", "Alumno", "Carrera", "Ciclo de reingreso", "Estado", "Accion"]}
          loading={cargando}
          loadingText="Cargando registros..."
          empty="No hay documentos de penalidad para mostrar."
          rows={penalidades}
          renderRow={(documento) => (
            <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
              <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.fecha ? documento.fecha.slice(0, 10) : ""}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.alumno_nombre}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.carrera_nombre}</td>
              <td className="border-t border-slate-200 px-4 py-3">{documento.ciclo_reingreso}</td>
              <td className="border-t border-slate-200 px-4 py-3"><StatusBadge value={documento.estado} /></td>
              <td className="border-t border-slate-200 px-4 py-3 text-center">
                <PrintButton onClick={() => handleImprimir(documento.id)} disabled={cargandoDoc} />
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
          <div ref={printRef} className="p-2">
            <DocumentoPenalidad doc={docSeleccionado} />
          </div>
        </PreviewModal>
      )}
    </>
  );
}