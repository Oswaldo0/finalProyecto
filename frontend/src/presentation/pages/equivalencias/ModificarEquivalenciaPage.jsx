import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  modificarEquivalencia,
  obtenerEquivalencia,
} from "../../../application/equivalencias/equivalenciasUseCases.js";
import { normalizeNonNegativeDecimal, toUppercaseText } from "../../utils/formNormalizers.js";

const TABLA_INICIAL = [
  {
    asignaturaCursada: "",
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
  const [lookupId, setLookupId] = useState(routeId ?? "");
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

  async function cargarEquivalencia(id) {
    if (!id) return;
    setCargando(true);
    setMensajeError("");
    setMensajeExito("");

    try {
      const equivalencia = await obtenerEquivalencia(id);
      setLoadedId(equivalencia.id);
      setLookupId(String(equivalencia.id));
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
    if (field === "uv" || field === "nota") return normalizeNonNegativeDecimal(value);
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

  function handleBuscar(event) {
    event.preventDefault();
    if (!lookupId.trim()) {
      setMensajeError("Ingrese el ID de una equivalencia.");
      return;
    }
    navigate(`/equivalencias/modificar/${lookupId.trim()}`);
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
        estado: "BORRADOR",
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
            Modificar equivalencia
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Busque una solicitud existente, revise sus datos y guarde los cambios autorizados.
          </p>
        </div>

        <form className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end" onSubmit={handleBuscar}>
          <TextInput label="ID de equivalencia" value={lookupId} onChange={setLookupId} />
          <button type="submit" disabled={cargando} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
            {cargando ? "Buscando..." : "Buscar"}
          </button>
        </form>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          {showCancelNotice ? <Alert tone="warning" message="Operación cancelada. Redirigiendo..." /> : null}
          {mensajeExito ? <Alert tone="success" message={mensajeExito} /> : null}
          {mensajeError ? <Alert tone="error" message={mensajeError} /> : null}
          {!loadedId ? (
            <section className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-blue-800">Seleccione un registro</p>
              <p className="mt-1 text-xs text-blue-700">
                Ingrese el ID de una equivalencia para cargarla antes de modificar.
              </p>
            </section>
          ) : null}

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
                    <Th center>U.V.</Th>
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
                      <Td><TableInput type="number" min="0" step="0.01" value={row.uv} onChange={(value) => handleTablaChange(index, "uv", value)} placeholder="0.00" center /></Td>
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
              {guardando ? "Actualizando..." : "Actualizar equivalencia"}
            </button>
          </div>
        </form>
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
