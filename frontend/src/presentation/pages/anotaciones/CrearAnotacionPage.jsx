import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CATALOGOS_INICIALES,
  crearAnotacion,
  obtenerCatalogosAnotaciones,
} from "../../../application/anotaciones/anotacionesUseCases.js";
import { AcademicCycleFields } from "../../components/shared/AcademicCycleFields.jsx";
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
};

export function CrearAnotacionPage() {
  const navigate = useNavigate();
  const [catalogos, setCatalogos] = useState(CATALOGOS_INICIALES);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
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

  function handleInputChange(field, value) {
    const finalValue = normalizeByField(field, value, { preserve: ["fecha"] });
    setFormulario((prev) => ({ ...prev, [field]: finalValue }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setGuardando(true);
    setMensajeExito("");
    setMensajeError("");

    try {
      await crearAnotacion(formulario);
      setFormulario(FORMULARIO_INICIAL);
      setMensajeExito("Observación de clases registrada correctamente.");
      setTimeout(() => navigate("/anotaciones/imprimir"), 1400);
    } catch (err) {
      setMensajeError(err.message || "No se pudo guardar la observación.");
    } finally {
      setGuardando(false);
    }
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/anotaciones"), 1200);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-800">
            Formulario para observación de clases
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Complete los datos requeridos para registrar la observación académica.
          </p>
          <p className="mt-2 text-sm text-red-600">* Obligatorio</p>
        </div>

        <form
          className="mt-4 grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
          aria-label="Formulario crear observación de clases"
          onSubmit={handleSubmit}
        >
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
              <Input
                number="2"
                label="Fecha de observación"
                type="date"
                required
                value={formulario.fecha}
                onChange={(value) => handleInputChange("fecha", value)}
              />
              <Input
                number="3"
                label="Hora de inicio de observación"
                helper="Ejemplo: 8:30 a.m., 8:30 p.m."
                required
                value={formulario.horaInicio}
                onChange={(value) => handleInputChange("horaInicio", value)}
              />
              <Input
                number="4"
                label="Hora de fin de observación"
                helper="Ejemplo: 8:30 a.m., 8:30 p.m."
                required
                value={formulario.horaFin}
                onChange={(value) => handleInputChange("horaFin", value)}
              />
            </div>

            <Input
              number="5"
              label="Asignatura/grupo"
              required
              value={formulario.asignaturaGrupo}
              onChange={(value) => handleInputChange("asignaturaGrupo", value)}
            />

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
              <Select
                label="Horario"
                required
                value={formulario.horario}
                options={catalogos.horarios}
                onChange={(value) => handleInputChange("horario", value)}
              />
              <Input
                label="Docente observado"
                value={formulario.docente}
                onChange={(value) => handleInputChange("docente", value)}
              />
              <Input
                label="Aula"
                value={formulario.aula}
                onChange={(value) => handleInputChange("aula", value)}
              />
              <AcademicCycleFields
                value={formulario.ciclo}
                onChange={(value) => handleInputChange("ciclo", value)}
                required
              />
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Observaciones</span>
              <textarea
                className="min-h-[120px] rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Detalle de la observación"
                value={formulario.observaciones}
                onChange={(event) => handleInputChange("observaciones", event.target.value)}
              />
            </label>
          </FormSection>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelAction}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar observación"}
            </button>
          </div>
        </form>
      </section>

      {showCancelNotice ? (
        <Toast title="Se ha cancelado esta acción" detail="Redirigiendo a Anotaciones..." tone="warning" />
      ) : null}
      {mensajeExito ? <Toast title={mensajeExito} detail="Redirigiendo a Imprimir anotación..." tone="success" /> : null}
      {mensajeError ? <Toast title="Error al guardar" detail={mensajeError} tone="error" /> : null}
    </main>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-900">{title}</h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, number, helper, type = "text", required = false, placeholder = "Escriba su respuesta" }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium uppercase text-slate-800">
        {number ? `${number}. ` : ""}{label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
      <input
        type={type}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        placeholder={placeholder}
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
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <select
        className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        <option value="">Seleccione una opción</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function RadioGroup({ label, value, options, onChange, number, required = false }) {
  return (
    <fieldset className="grid gap-3 text-sm">
      <legend className="font-medium uppercase text-slate-800">
        {number ? `${number}. ` : ""}{label} {required ? <span className="text-red-600">*</span> : null}
      </legend>
      <div className="grid gap-2 md:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <input
              type="radio"
              name={label}
              value={option}
              checked={value === option}
              onChange={(event) => onChange(event.target.value)}
              required={required}
              className="h-4 w-4"
            />
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
    <div className={`fixed right-4 top-20 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg ${styles[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs">{detail}</p>
    </div>
  );
}
