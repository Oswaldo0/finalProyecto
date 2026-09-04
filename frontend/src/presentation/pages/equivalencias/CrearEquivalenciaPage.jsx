import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearEquivalencia } from "../../../application/equivalencias/equivalenciasUseCases.js";
import { AcademicUvFields } from "../../components/shared/AcademicUvFields.jsx";
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

export function CrearEquivalenciaPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [tabla, setTabla] = useState(TABLA_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const [nombre, setNombre] = useState("");
  const [carrerasCursadas, setCarrerasCursadas] = useState("");
  const [carreraDestino, setCarreraDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [firmaAlumno, setFirmaAlumno] = useState("");

  const [textoSolicitud, setTextoSolicitud] = useState(TEXTO_SOLICITUD_INICIAL);
  const [notasReservado, setNotasReservado] = useState("");
  const [firmaDecano, setFirmaDecano] = useState("");
  const [fechaDecano, setFechaDecano] = useState("");

  function normalizeTablaField(field, value) {
    if (field === "nota") return normalizeNonNegativeDecimal(value);
    if (field === "asignaturaCursada" || field === "asignaturaSolicitada" || field === "institucion") {
      return toUppercaseText(value);
    }
    return value;
  }

  function handleTablaChange(index, field, value) {
    setTabla((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: normalizeTablaField(field, value) } : row,
      ),
    );
  }

  function handleTablaUvChange(index, horasAcademicas, uv) {
    setTabla((prev) =>
      prev.map((row, i) => (i === index ? { ...row, horasAcademicas, uv } : row)),
    );
  }

  function handleResultado(index, resultado) {
    setTabla((prev) =>
      prev.map((row, i) =>
        i === index
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

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito("");
    setMensajeError("");

    try {
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
          decano_nombre: firmaDecano.trim() || null,
          fecha_decano: fechaDecano || null,
          alumno_nombre_firma: firmaAlumno.trim() || null,
          estado: "CREADO",
        },
        detalles,
      };

      await crearEquivalencia(payload);
      setMensajeExito("Equivalencia guardada correctamente.");
      setTabla(TABLA_INICIAL);
      setNombre("");
      setCarrerasCursadas("");
      setCarreraDestino("");
      setFecha("");
      setFirmaAlumno("");
      setTextoSolicitud(TEXTO_SOLICITUD_INICIAL);
      setNotasReservado("");
      setFirmaDecano("");
      setFechaDecano("");
      setTimeout(() => navigate("/equivalencias/imprimir"), 1200);
    } catch (err) {
      setMensajeError(err.message || "Error al guardar la equivalencia.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold uppercase tracking-wide text-slate-800">
            Solicitud de equivalencias
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Registre los datos del estudiante, las asignaturas cursadas y la decisión académica correspondiente.
          </p>
        </div>

        <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
          {showCancelNotice ? <Alert tone="warning" message="Operación cancelada. Redirigiendo..." /> : null}
          {mensajeExito ? <Alert tone="success" message={mensajeExito} /> : null}
          {mensajeError ? <Alert tone="error" message={mensajeError} /> : null}

          <Section title="Datos del estudiante">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInput label="Nombre" value={nombre} onChange={(value) => setNombre(toUppercaseText(value))} required />
              <TextInput label="Nombre para firma" value={firmaAlumno} onChange={(value) => setFirmaAlumno(toUppercaseText(value))} />
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
              <TextInput label="Nombre del decano" value={firmaDecano} onChange={(value) => setFirmaDecano(toUppercaseText(value))} />
              <TextInput label="Fecha de aprobación" type="date" value={fechaDecano} onChange={setFechaDecano} />
            </div>
          </Section>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelAction} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
              {guardando ? "Guardando..." : "Guardar equivalencia"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
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

function TextInput({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="rounded-lg border border-slate-300 bg-white px-3 py-2" />
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
