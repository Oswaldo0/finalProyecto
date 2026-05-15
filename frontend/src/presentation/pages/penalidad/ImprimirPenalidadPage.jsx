import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPenalidades, obtenerPenalidad } from "../../../application/penalidad/penalidadUseCases.js";

function DocumentoPenalidad({ doc }) {
  const numAsignaturas = doc.asignaturas.length;
  const enLetras = numAsignaturas === 1 ? "una" : numAsignaturas === 2 ? "dos" : numAsignaturas === 3 ? "tres" : numAsignaturas === 4 ? "cuatro" : String(numAsignaturas);

  return (
    <div className="mx-auto max-w-2xl bg-white px-10 py-8 font-serif text-sm leading-relaxed text-slate-900">
      {/* Encabezado */}
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-bold uppercase tracking-widest">MEMORANDO:</span>
        <span>{doc.correlativo} ({doc.anioEgreso})</span>
      </div>
      <div className="mb-4 border-b border-slate-400" />

      {/* Campos del memorando */}
      <table className="mb-1 w-full text-xs" style={{ borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td className="w-20 py-0.5 align-top font-bold">PARA:</td>
            <td className="py-0.5">
              {doc.secretarioNombres} {doc.secretarioApellidos}<br />
              <span className="font-semibold uppercase">Secretario General</span>
            </td>
          </tr>
          <tr>
            <td className="w-20 py-0.5 align-top font-bold">DE:</td>
            <td className="py-0.5">{doc.decanoNombres} {doc.decanoApellidos}</td>
          </tr>
          <tr>
            <td className="w-20 py-0.5 align-top font-bold">ASUNTO:</td>
            <td className="py-0.5 font-semibold uppercase">
              Penalización por más de {doc.cantidadAniosEgreso} años de egreso
            </td>
          </tr>
          <tr>
            <td className="w-20 py-0.5 align-top font-bold">FECHA:</td>
            <td className="py-0.5">{doc.fecha}</td>
          </tr>
        </tbody>
      </table>
      <div className="mb-4 border-b border-slate-400" />

      {/* Cuerpo */}
      <p className="mb-3 text-justify text-xs">
        Respetuosamente informo que el bachiller{" "}
        <strong>{doc.alumnoNombres} {doc.alumnoApellidos}</strong>{" "}
        ha solicitado el reingreso a la carrera de{" "}
        <strong>{doc.carrera}</strong>.
      </p>

      <p className="mb-4 text-justify text-xs">
        El bachiller egresó el <strong>{doc.mesEgreso}</strong> de{" "}
        <strong>{doc.anioEgreso}</strong>, por lo que tiene a esta fecha,{" "}
        <strong>{doc.aniosEgresado}</strong> años de haber egresado. Por tal razón, y de acuerdo
        al artículo 25 de Reglamento de Administración Académica, que en el literal a, dice que
        aquellos que tengan entre tres y otros años de egreso, deberán cursar las asignaturas para
        efecto de penalización, se les asigna que el bachiller debe aprobar a las aulas en el
        presente ciclo <strong>{doc.cicloReingreso}</strong> o cursar las siguientes asignaturas:
      </p>

      {/* Lista numerada de asignaturas */}
      <ol className="mb-4 list-none pl-6 text-xs" style={{ listStyleType: "none" }}>
        {doc.asignaturas.map((a, i) => (
          <li key={i} className="flex justify-between py-0.5">
            <span>{i + 1}. {a.nombre}</span>
            <span className="mr-8">{String(a.uv).padStart(2, "0")}</span>
          </li>
        ))}
      </ol>

      <p className="mb-6 text-justify text-xs">
        Solicita se coordine con la Facultad de Tecnología Informática, para generar las
        condiciones informáticas que permitan al bachiller inscribir las {enLetras} asignaturas.
      </p>

      <p className="text-xs">Atentamente,</p>
    </div>
  );
}


export function ImprimirPenalidadPage() {
  const navigate = useNavigate();
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
      // Mapear campos del API al formato que espera DocumentoPenalidad
      const doc = {
        id: pen.id,
        correlativo: pen.correlativo,
        fecha: pen.fecha ? pen.fecha.slice(0, 10) : "",
        alumno: pen.alumno_nombre,
        carrera: pen.carrera_nombre,
        cicloReingreso: pen.ciclo_reingreso,
        estado: pen.estado,
        secretarioNombres: pen.secretario_nombre ?? "",
        secretarioApellidos: "",
        decanoNombres: pen.decano_nombre ?? "",
        decanoApellidos: "",
        cantidadAniosEgreso: pen.cantidad_anios_egreso,
        alumnoNombres: pen.alumno_nombre ?? "",
        alumnoApellidos: "",
        mesEgreso: pen.mes_egreso,
        anioEgreso: pen.anio_egreso,
        aniosEgresado: pen.anios_egresado,
        asignaturas: (pen.asignaturas ?? []).map((a) => ({
          nombre: a.asignatura_nombre,
          uv: a.uv ?? 0,
        })),
      };
      setDocSeleccionado(doc);
    } catch {
      alert("No se pudo cargar el documento de penalidad.");
    } finally {
      setCargandoDoc(false);
    }
  }

  function ejecutarImpresion() {
    if (!docSeleccionado) return;
    const d = docSeleccionado;
    const numAsignaturas = d.asignaturas.length;
    const enLetras = ["una","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez"][numAsignaturas - 1] ?? String(numAsignaturas);

    const ventana = window.open("", "_blank", "width=850,height=700");
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Memorando ${d.correlativo}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Georgia, serif; font-size: 12px; color: #111; padding: 60px 70px; }
          .memo-header { display: flex; justify-content: space-between; font-weight: bold; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
          hr { border: none; border-top: 1px solid #555; margin-bottom: 14px; }
          .campo { display: table; width: 100%; margin-bottom: 2px; font-size: 12px; }
          .campo-label { display: table-cell; width: 80px; font-weight: bold; vertical-align: top; }
          .campo-valor { display: table-cell; vertical-align: top; }
          .body-text { text-align: justify; margin-bottom: 12px; font-size: 12px; line-height: 1.6; }
          .asignaturas { margin: 0 0 14px 40px; }
          .asig-row { display: flex; justify-content: space-between; padding: 1px 0; }
          .asig-uv { margin-right: 80px; }
          .atentos { margin-top: 20px; }
          @media print { body { padding: 30px 50px; } }
        </style>
      </head>
      <body>
        <div class="memo-header">
          <span>MEMORANDO:</span>
          <span>${d.correlativo} (${d.anioEgreso})</span>
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
          El bachiller egresó el <strong>${d.mesEgreso}</strong> de <strong>${d.anioEgreso}</strong>, por lo que tiene a esta fecha, <strong>${d.aniosEgresado}</strong> años de haber egresado. Por tal razón, y de acuerdo al artículo 25 de Reglamento de Administración Académica, que en el literal a, dice que aquellos que tengan entre tres y otros años de egreso, deberán cursar las asignaturas para efecto de penalización, se les asigna que el bachiller debe aprobar a las aulas en el presente ciclo <strong>${d.cicloReingreso}</strong> o cursar las siguientes asignaturas:
        </p>

        <div class="asignaturas">
          ${d.asignaturas.map((a, i) => `<div class="asig-row"><span>${i + 1}. ${a.nombre}</span><span class="asig-uv">${String(a.uv).padStart(2, "0")}</span></div>`).join("")}
        </div>

        <p class="body-text">
          Solicita se coordine con la Facultad de Tecnología Informática, para generar las condiciones informáticas que permitan al bachiller inscribir las ${enLetras} asignaturas.
        </p>

        <p class="atentos">Atentamente,</p>
      </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 400);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-700">
              Imprimir penalidad
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Selecciona un documento de penalidad para previsualizarlo e
              imprimirlo.
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

        {cargando ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            Cargando registros...
          </div>
        ) : penalidades.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Sin documentos disponibles</p>
            <p className="mt-1 text-xs text-blue-700">
              Crea tu primera penalidad en "Crear penalidad" para verla aquí.
            </p>
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                  Correlativo
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                  Fecha
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                  Alumno
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                  Carrera
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                  Ciclo de reingreso
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
                  Estado
                </th>
                <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold text-slate-700">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody>
              {penalidades.length === 0 && !cargando ? (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-sm text-slate-500">
                    No hay documentos de penalidad para mostrar.
                  </td>
                </tr>
              ) : (
                penalidades.map((documento) => (
                  <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
                    <td className="border-t border-slate-200 px-4 py-3">{documento.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-3">
                      {documento.fecha ? documento.fecha.slice(0, 10) : ""}
                    </td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.alumno_nombre}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.carrera_nombre}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.ciclo_reingreso}</td>
                    <td className="border-t border-slate-200 px-4 py-3">{documento.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleImprimir(documento.id)}
                        disabled={cargandoDoc}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
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

      {/* Modal de vista previa */}
      {docSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Barra de acciones del modal */}
            <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 bg-slate-50 px-5 py-3">
              <span className="text-sm font-semibold text-slate-700">
                Vista previa — {docSeleccionado.correlativo}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={ejecutarImpresion}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    print
                  </span>
                  Imprimir / Guardar PDF
                </button>
                <button
                  type="button"
                  onClick={() => setDocSeleccionado(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Contenido del documento */}
            <div ref={printRef} className="p-2">
              <DocumentoPenalidad doc={docSeleccionado} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
