import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CATALOGOS_INICIALES,
  modificarAnotacion,
  obtenerAnotacion,
  obtenerCatalogosAnotaciones,
} from "../../../application/anotaciones/anotacionesUseCases.js";
import { normalizeByField } from "../../utils/formNormalizers.js";

const FORMULARIO_INICIAL = {
  observador: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  asignaturaGrupo: "",
  facultad: "",
  horario: "",
  docente: "",
  aula: "",
  ciclo: "",
  observaciones: "",
  estado: "BORRADOR",
};

export function ModificarAnotacionPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [catalogos, setCatalogos] = useState(CATALOGOS_INICIALES);
  const [lookupId, setLookupId] = useState(routeId ?? "");
  const [loadedId, setLoadedId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [showCancelNotice, setShowCancelNotice] = useState(false);

  useEffect(() => {
    let mounted = true;
    obtenerCatalogosAnotaciones().then((result) => {
      if (mounted) setCatalogos(result);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (routeId) cargarAnotacion(routeId);
  }, [routeId]);

  async function cargarAnotacion(id) {
    if (!id) return;
    setCargando(true);
    setMensajeError("");
    setMensajeExito("");

    try {
      const anotacion = await obtenerAnotacion(id);
      setLoadedId(anotacion.id);
      setLookupId(String(anotacion.id));
      setFormulario({
        observador: anotacion.observador ?? "",
        fecha: formatDateInput(anotacion.fecha),
        horaInicio: anotacion.horaInicio ?? "",
        horaFin: anotacion.horaFin ?? "",
        asignaturaGrupo: anotacion.asignaturaGrupo ?? "",
        facultad: anotacion.facultad ?? "",
        horario: anotacion.horario ?? "",
        docente: anotacion.docente ?? "",
        aula: anotacion.aula ?? "",
        ciclo: anotacion.ciclo ?? "",
        observaciones: anotacion.observaciones ?? "",
        estado: anotacion.estado ?? "BORRADOR",
      });
    } catch (err) {
      setLoadedId(null);
      setMensajeError(err.message || "No se pudo cargar la anotación.");
    } finally {
      setCargando(false);
    }
  }

  function handleInputChange(field, value) {
    const finalValue = normalizeByField(field, value, { preserve: ["fecha", "estado"] });
    setFormulario((prev) => ({ ...prev, [field]: finalValue }));
  }

  function handleBuscar(event) {
    event.preventDefault();
    if (!lookupId.trim()) {
      setMensajeError("Ingrese el ID de una anotación.");
      return;
    }
    navigate(`/anotaciones/modificar/${lookupId.trim()}`);
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/anotaciones"), 1200);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    if (!loadedId) {
      setMensajeError("Debe cargar una anotación antes de actualizar.");
      return;
    }

    setGuardando(true);
    try {
      await modificarAnotacion(loadedId, formulario);
      setMensajeExito("Anotación actualizada correctamente.");
    } catch (err) {
      setMensajeError(err.message || "No se pudo actualizar la anotación.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-800">
            Modificar observación de clases
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Busque una observación registrada y actualice los datos académicos correspondientes.
          </p>
        </div>

        <form className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end" onSubmit={handleBuscar}>
          <Input label="ID de anotación" value={lookupId} onChange={setLookupId} />
          <button type="submit" disabled={cargando} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
            {cargando ? "Buscando..." : "Buscar"}
          </button>
        </form>

        <form className="mt-4 grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario modificar observación de clases" onSubmit={handleSubmit}>
          {showCancelNotice ? <Toast title="Se ha cancelado esta acción" detail="Redirigiendo a Anotaciones..." tone="warning" /> : null}
          {mensajeExito ? <Toast title={mensajeExito} detail="Los cambios fueron guardados." tone="success" /> : null}
          {mensajeError ? <Toast title="No se pudo completar la acción" detail={mensajeError} tone="error" /> : null}
          {!loadedId ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-blue-800">Seleccione un registro</p>
              <p className="mt-1 text-xs text-blue-700">Ingrese el ID de una anotación para cargarla antes de modificar.</p>
            </div>
          ) : null}

          <FormSection title="Datos generales">
            <RadioGroup
              number="1"
              label="Observador"
              required
              value={formulario.observador}
              options={catalogos.observadores}
              onChange={(value) => handleInputChange("observador", value)}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input number="2" label="Fecha de observación" type="date" required value={formulario.fecha} onChange={(value) => handleInputChange("fecha", value)} />
              <Input number="3" label="Hora de inicio de observación" helper="Ejemplo: 8:30 a.m., 8:30 p.m." required value={formulario.horaInicio} onChange={(value) => handleInputChange("horaInicio", value)} />
              <Input number="4" label="Hora de fin de observación" helper="Ejemplo: 8:30 a.m., 8:30 p.m." required value={formulario.horaFin} onChange={(value) => handleInputChange("horaFin", value)} />
            </div>

            <Input number="5" label="Asignatura/grupo" required value={formulario.asignaturaGrupo} onChange={(value) => handleInputChange("asignaturaGrupo", value)} />

            <RadioGroup
              number="6"
              label="Facultad / escuela a la que pertenece"
              required
              value={formulario.facultad}
              options={catalogos.facultades}
              onChange={(value) => handleInputChange("facultad", value)}
            />
          </FormSection>

          <FormSection title="Información de la clase">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select label="Horario" required value={formulario.horario} options={catalogos.horarios} onChange={(value) => handleInputChange("horario", value)} />
              <Input label="Docente observado" required value={formulario.docente} onChange={(value) => handleInputChange("docente", value)} />
              <Input label="Aula" required value={formulario.aula} onChange={(value) => handleInputChange("aula", value)} />
              <Input label="Ciclo académico" required value={formulario.ciclo} onChange={(value) => handleInputChange("ciclo", value)} />
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Observaciones</span>
              <textarea
                className="min-h-[140px] rounded-lg border border-slate-300 px-3 py-2 leading-relaxed"
                placeholder="Detalle de la observación"
                value={formulario.observaciones}
                onChange={(event) => handleInputChange("observaciones", event.target.value)}
                required
              />
            </label>
          </FormSection>

          <FormSection title="Estado">
            <Select
              label="Estado del documento"
              value={formulario.estado}
              options={["BORRADOR", "EMITIDA", "ANULADA"]}
              onChange={(value) => handleInputChange("estado", value)}
            />
          </FormSection>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelAction} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" disabled={!loadedId || guardando} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
              {guardando ? "Actualizando..." : "Actualizar observación"}
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

function FormSection({ title, children }) {
  return (
    <section className="grid gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, number, helper, type = "text", required = false }) {
  return (
    <label className="grid flex-1 gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {number ? `${number}. ` : ""}
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
      <input
        type={type}
        className="rounded-lg border border-slate-300 px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function Select({ label, value, options, onChange, required = false }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <select className="rounded-lg border border-slate-300 bg-white px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">Seleccione una opción</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RadioGroup({ number, label, value, options, onChange, required = false }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium text-slate-700">
        {number}. {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </legend>
      <div className="grid gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-300">
            <input type="radio" checked={value === option} onChange={() => onChange(option)} required={required && !value} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Toast({ title, detail, tone }) {
  const styles = {
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${styles[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs">{detail}</p>
    </div>
  );
}
