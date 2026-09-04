import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  listarEquivalencias,
  modificarEquivalencia,
  obtenerEquivalencia,
} from "../../../application/equivalencias/equivalenciasUseCases.js";
import { AcademicUvFields, hoursFromUv } from "../../components/shared/AcademicUvFields.jsx";
import { normalizeNonNegativeDecimal, toUppercaseText } from "../../utils/formNormalizers.js";

const TABLA_INICIAL = [
  {
    asignaturaCursada: "",
    horasAcademicas: "",
    uv: "",
    nota: "",
    institucion: "",
    asignaturaSolicitada: "",
    ap: false,
    de: false,
  },
];

const TEXTO_SOLICITUD_INICIAL =
  "SEÑOR DECANO DE LA FACULTAD DE INGENIERÍA, POR MEDIO DE LA PRESENTE SOLICITO SE ME CONCEDA POR EQUIVALENCIAS LAS MATERIAS SIGUIENTES:";

export function ModificarEquivalenciaPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoLista, setCargandoLista] = useState(true);
  const [loadedId, setLoadedId] = useState(null);
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tabla, setTabla] = useState(TABLA_INICIAL);
  const [nombre, setNombre] = useState("");
  const [carrerasCursadas, setCarrerasCursadas] = useState("");
  const [carreraDestino, setCarreraDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [nombreAlumno, setNombreAlumno] = useState("");
  const [textoSolicitud, setTextoSolicitud] = useState(TEXTO_SOLICITUD_INICIAL);
  const [notasReservado, setNotasReservado] = useState("");
  const [nombreDecano, setNombreDecano] = useState("");
  const [fechaDecano, setFechaDecano] = useState("");

  useEffect(() => {
    if (routeId) cargarEquivalencia(routeId);
  }, [routeId]);

  useEffect(() => {
    listarEquivalencias({ limit: 100 })
      .then((res) => setLista(res.data ?? []))
      .catch(() => setLista([]))
      .finally(() => setCargandoLista(false));
  }, []);

  const listaFiltrada = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return lista;

    return lista.filter((equivalencia) => {
      const texto = [
        equivalencia.correlativo,
        equivalencia.alumno_nombre,
        equivalencia.carrera_destino,
        equivalencia.fecha_solicitud ? String(equivalencia.fecha_solicitud).slice(0, 10) : "",
        equivalencia.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termino);
    });
  }, [busqueda, lista]);

  async function cargarEquivalencia(id) {
    if (!id) return;
    setCargando(true);
    setMensajeError("");
    setMensajeExito("");

    try {
      const equivalencia = await obtenerEquivalencia(id);
      setLoadedId(equivalencia.id);
      setNombre(equivalencia.alumno_nombre ?? "");
      setCarrerasCursadas(equivalencia.carreras_cursadas ?? "");
      setCarreraDestino(equivalencia.carrera_destino ?? "");
      setFecha(formatDateInput(equivalencia.fecha_solicitud));
      setNombreAlumno(equivalencia.alumno_nombre_firma ?? equivalencia.alumno_nombre ?? "");
      setTextoSolicitud(equivalencia.texto_solicitud ?? TEXTO_SOLICITUD_INICIAL);
      setNotasReservado(equivalencia.notas_universidad ?? "");
      setNombreDecano(equivalencia.decano_nombre ?? "");
      setFechaDecano(formatDateInput(equivalencia.fecha_decano));
      setTabla(
        equivalencia.detalles?.length
          ? equivalencia.detalles.map((detalle) => ({
              asignaturaCursada: detalle.asignatura_cursada ?? "",
              horasAcademicas: hoursFromUv(detalle.uv),
              uv: detalle.uv != null ? String(detalle.uv) : "",
              nota: detalle.nota != null ? String(detalle.nota) : "",
              institucion: detalle.institucion_nombre ?? "",
              asignaturaSolicitada: detalle.asignatura_solicitada ?? "",
              ap: detalle.resultado === "APROBADA",
              de: detalle.resultado === "DENEGADA",
            }))
          : TABLA_INICIAL,
      );
    } catch (err) {
      setLoadedId(null);
      setMensajeError(err.message || "No se pudo cargar la equivalencia.");
    } finally {
      setCargando(false);
    }
  }

  function normalizeTablaField(field, value) {
    if (field === "nota") return normalizeNonNegativeDecimal(value);
    if (field === "asignaturaCursada" || field === "asignaturaSolicitada" || field === "institucion") {
      return toUppercaseText(value);
    }
    return value;
  }

  function handleTablaChange(index, field, value) {
    setTabla((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index ? { ...row, [field]: normalizeTablaField(field, value) } : row,
      ),
    );
  }

  function handleTablaUvChange(index, horasAcademicas, uv) {
    setTabla((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index ? { ...row, horasAcademicas, uv } : row,
      ),
    );
  }

  function handleResultado(index, resultado) {
    setTabla((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index
          ? {
              ...row,
              ap: resultado === "APROBADA",
              de: resultado === "DENEGADA",
            }
          : row,
      ),
    );
  }

  function agregarFila() {
    setTabla((prev) => [...prev, { ...TABLA_INICIAL[0] }]);
  }

  function eliminarFila(index) {
    setTabla((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/equivalencias"), 1200);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    if (!loadedId) {
      setMensajeError("Debe cargar una equivalencia antes de actualizar.");
      return;
    }

    const detalles = tabla
      .filter((row) => row.asignaturaCursada.trim() !== "" && row.asignaturaSolicitada.trim() !== "")
      .map((row) => ({
        asignatura_cursada: row.asignaturaCursada.trim(),
        horas_academicas: row.horasAcademicas !== "" ? Number(row.horasAcademicas) : null,
        uv: row.uv !== "" ? Number(row.uv) : null,
        nota: row.nota !== "" ? Number(row.nota) : null,
        institucion_nombre: row.institucion.trim() || null,
        asignatura_solicitada: row.asignaturaSolicitada.trim(),
        resultado: row.ap ? "APROBADA" : row.de ? "DENEGADA" : "PENDIENTE",
      }));

    const payload = {
      equivalencia: {
        fecha_solicitud: fecha || null,
        alumno_nombre: nombre.trim(),
        carreras_cursadas: carrerasCursadas.trim() || null,
        carrera_destino: carreraDestino.trim() || null,
        texto_solicitud: textoSolicitud.trim(),
        notas_universidad: notasReservado.trim() || null,
        decano_nombre: nombreDecano.trim() || null,
        fecha_decano: fechaDecano || null,
        alumno_nombre_firma: nombreAlumno.trim() || null,
        estado: "CREADO",
      },
      detalles,
    };

    setGuardando(true);
    try {
      await modificarEquivalencia(loadedId, payload);
      setMensajeExito("Equivalencia actualizada correctamente.");
    } catch (err) {
      setMensajeError(err.message || "No se pudo actualizar la equivalencia.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold uppercase tracking-wide text-slate-800">
            Historial equivalencia
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Busque una solicitud existente, revise sus datos y guarde los cambios autorizados.
          </p>
        </div>

        <div className="mt-4">
          <label className="grid gap-1 text-sm sm:max-w-md">
            <span className="font-medium text-slate-700">Buscar reportes creados</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "1.15rem" }}>search</span>
              <input
                type="search"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Buscar por correlativo, alumno, carrera, fecha o estado"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
              {busqueda ? (
                <button type="button" onClick={() => setBusqueda("")} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Limpiar busqueda">
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
                </button>
              ) : null}
            </div>
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-x-auto">
          {cargandoLista ? (
            <p className="px-4 py-6 text-sm text-slate-500">Cargando registros...</p>
          ) : lista.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No hay equivalencias registradas aún.</p>
          ) : listaFiltrada.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No se encontraron equivalencias con esa búsqueda.</p>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Correlativo</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Alumno</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Carrera destino</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Fecha</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Estado</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-center text-xs font-semibold text-slate-600">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((equivalencia) => (
                  <tr key={equivalencia.id} className={`odd:bg-white even:bg-slate-50 ${loadedId === equivalencia.id ? "ring-2 ring-inset ring-blue-400" : ""}`}>
                    <td className="border-t border-slate-200 px-4 py-2">{equivalencia.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{equivalencia.alumno_nombre}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{equivalencia.carrera_destino || "-"}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{equivalencia.fecha_solicitud ? String(equivalencia.fecha_solicitud).slice(0, 10) : ""}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{equivalencia.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => cargarEquivalencia(equivalencia.id)}
                        disabled={cargando}
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        {loadedId === equivalencia.id ? "Seleccionado" : "Editar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loadedId && !cargando ? (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Selecciona una equivalencia de la lista para editarla.</p>
          </div>
        ) : null}

        {loadedId && !cargando ? (
        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          {showCancelNotice ? <Alert tone="warning" message="Operación cancelada. Redirigiendo..." /> : null}
          {mensajeExito ? <Alert tone="success" message={mensajeExito} /> : null}
          {mensajeError ? <Alert tone="error" message={mensajeError} /> : null}
          <Section title="Datos del estudiante">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput label="Nombre" value={nombre} onChange={(value) => setNombre(toUppercaseText(value))} />
              <TextInput label="Nombre para firma" value={nombreAlumno} onChange={(value) => setNombreAlumno(toUppercaseText(value))} />
              <TextInput label="Carrera(s) cursada(s)" value={carrerasCursadas} onChange={(value) => setCarrerasCursadas(toUppercaseText(value))} />
              <TextInput label="Carrera que estudia o pretende estudiar" value={carreraDestino} onChange={(value) => setCarreraDestino(toUppercaseText(value))} />
              <TextInput label="Fecha de solicitud" type="date" value={fecha} onChange={setFecha} />
            </div>
          </Section>

          <Section
            title="Asignaturas"
            action={
              <button type="button" onClick={agregarFila} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Agregar fila
              </button>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="min-w-[980px] w-full border-collapse text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <Th>Asignatura cursada</Th>
                    <Th center>Horas / U.V.</Th>
                    <Th center>Nota</Th>
                    <Th>Institución</Th>
                    <Th>Asignatura solicitada</Th>
                    <Th center>Resultado</Th>
                    <Th center>Acción</Th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-slate-50">
                      <Td><TableInput value={row.asignaturaCursada} onChange={(value) => handleTablaChange(index, "asignaturaCursada", value)} placeholder="Asignatura cursada" /></Td>
                      <Td>
                        <AcademicUvFields
                          compact
                          hours={row.horasAcademicas}
                          uv={row.uv}
                          onChange={(hours, uv) => handleTablaUvChange(index, hours, uv)}
                        />
                      </Td>
                      <Td><TableInput type="number" min="0" step="0.01" value={row.nota} onChange={(value) => handleTablaChange(index, "nota", value)} placeholder="0.00" center /></Td>
                      <Td><TableInput value={row.institucion} onChange={(value) => handleTablaChange(index, "institucion", value)} placeholder="Institución" /></Td>
                      <Td><TableInput value={row.asignaturaSolicitada} onChange={(value) => handleTablaChange(index, "asignaturaSolicitada", value)} placeholder="Asignatura solicitada" /></Td>
                      <Td>
                        <div className="flex justify-center gap-1">
                          <ResultButton active={row.ap} label="AP" onClick={() => handleResultado(index, row.ap ? "PENDIENTE" : "APROBADA")} />
                          <ResultButton active={row.de} label="DE" onClick={() => handleResultado(index, row.de ? "PENDIENTE" : "DENEGADA")} />
                        </div>
                      </Td>
                      <Td>
                        <button type="button" onClick={() => eliminarFila(index)} disabled={tabla.length === 1} className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40">
                          Eliminar
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">AP = Aprobada. DE = Denegada. Sin selección = Pendiente.</p>
          </Section>

          <Section title="Solicitud">
            <Textarea label="Texto de solicitud" value={textoSolicitud} onChange={(value) => setTextoSolicitud(toUppercaseText(value))} rows={4} />
          </Section>

          <Section title="Reservado para la universidad">
            <Textarea label="Notas internas" value={notasReservado} onChange={(value) => setNotasReservado(toUppercaseText(value))} rows={4} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput label="Nombre del decano" value={nombreDecano} onChange={(value) => setNombreDecano(toUppercaseText(value))} />
              <TextInput label="Fecha de aprobación" type="date" value={fechaDecano} onChange={setFechaDecano} />
            </div>
          </Section>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelAction} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" disabled={!loadedId || guardando} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
              {guardando ? "Guardando..." : "Historial equivalencia"}
            </button>
          </div>
        </form>
        ) : null}
      </section>
    </main>
  );
}

function formatDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function Section({ title, action, children }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function TextInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid flex-1 gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2" />
    </label>
  );
}

function Textarea({ label, value, onChange, rows }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 leading-relaxed" />
    </label>
  );
}

function TableInput({ value, onChange, type = "text", min, step, placeholder, center = false }) {
  return (
    <input
      type={type}
      min={min}
      step={step}
      inputMode={type === "number" ? "decimal" : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (type === "number" && ["e", "+", "-"].includes(event.key)) event.preventDefault();
      }}
      placeholder={placeholder}
      className={`w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 outline-none focus:border-slate-400 ${center ? "text-center" : ""}`}
    />
  );
}

function ResultButton({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-md px-2 py-1 text-xs font-semibold ${active ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}>
      {label}
    </button>
  );
}

function Th({ children, center = false }) {
  return <th className={`border-b border-slate-200 px-3 py-2 font-semibold ${center ? "text-center" : "text-left"}`}>{children}</th>;
}

function Td({ children }) {
  return <td className="border-t border-slate-200 px-2 py-2 align-top">{children}</td>;
}

function Alert({ tone, message }) {
  const styles = {
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${styles[tone]}`}>{message}</div>;
}
