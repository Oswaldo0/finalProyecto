import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearConsulta } from "../../../application/consultas/consultasUseCases.js";
import { AcademicCycleFields } from "../../components/shared/AcademicCycleFields.jsx";
import { normalizeByField } from "../../utils/formNormalizers.js";

const FORMULARIO_INICIAL = {
  coordinadorNombres: "",
  coordinadorApellidos: "",
  alumnoNombres: "",
  alumnoApellidos: "",
  fechaConsulta: "",
  ciclo: "",
  carrera: "",
  materia: "SIN ASIGNAR",
  tipoConsulta: "",
  consulta: "",
  respuesta: "",
};

const TIPOS_CONSULTA = [
  "ACADEMICA",
  "INSCRIPCION DE ASIGNATURAS",
  "RETIRO O REINGRESO",
  "EQUIVALENCIAS",
  "PROCESO ADMINISTRATIVO",
  "OTRA",
];

export function CrearConsultaPage() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCancelNotice, setShowCancelNotice] = useState(false);

  function handleInputChange(field, value) {
    const finalValue = normalizeByField(field, value, {
      preserve: ["fechaConsulta", "tipoConsulta"],
    });
    setFormulario((prev) => ({ ...prev, [field]: finalValue }));
    setErrores((prev) => ({ ...prev, [field]: "" }));
    setMensajeExito("");
    setMensajeError("");
  }

  function validarFormulario() {
    const nextErrores = {};

    if (!formulario.tipoConsulta) nextErrores.tipoConsulta = "Seleccione el tipo de consulta.";
    if (!formulario.coordinadorNombres.trim()) nextErrores.coordinadorNombres = "Ingrese los nombres del coordinador.";
    if (!formulario.coordinadorApellidos.trim()) nextErrores.coordinadorApellidos = "Ingrese los apellidos del coordinador.";
    if (!formulario.alumnoNombres.trim()) nextErrores.alumnoNombres = "Ingrese los nombres del alumno.";
    if (!formulario.alumnoApellidos.trim()) nextErrores.alumnoApellidos = "Ingrese los apellidos del alumno.";
    if (!formulario.fechaConsulta) nextErrores.fechaConsulta = "Seleccione la fecha de la consulta.";
    if (!formulario.ciclo.trim()) nextErrores.ciclo = "Ingrese el ciclo academico.";
    if (!formulario.carrera.trim()) nextErrores.carrera = "Ingrese el nombre de la carrera.";
    if (!formulario.materia.trim()) nextErrores.materia = "Ingrese la materia o conserve SIN ASIGNAR.";
    if (!formulario.consulta.trim()) nextErrores.consulta = "Describa la consulta presentada.";
    if (!formulario.respuesta.trim()) nextErrores.respuesta = "Registre la respuesta brindada al estudiante.";

    setErrores(nextErrores);
    return Object.keys(nextErrores).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validarFormulario()) return;

    try {
      setIsSaving(true);
      setMensajeError("");
      const consultaGuardada = await crearConsulta(formulario);
      setMensajeExito(`Consulta registrada correctamente${consultaGuardada?.correlativo ? `: ${consultaGuardada.correlativo}` : "."}`);
      setFormulario(FORMULARIO_INICIAL);
      setErrores({});
    } catch (error) {
      setMensajeError(error.message || "No se pudo guardar la consulta.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancelar() {
    setShowCancelNotice(true);
    window.setTimeout(() => navigate("/consultas"), 900);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-800">
            Consulta de estudiantes
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Registre la atencion brindada por coordinacion y la respuesta entregada al estudiante.
          </p>
        </div>

        <form className="mt-4 grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" onSubmit={handleSubmit}>
          {showCancelNotice ? <Toast title="Se ha cancelado esta accion" detail="Redirigiendo a Consultas..." tone="warning" /> : null}
          {mensajeExito ? <Toast title={mensajeExito} detail="Puede registrar una nueva consulta." tone="success" /> : null}
          {mensajeError ? <Toast title="No se pudo guardar la consulta" detail={mensajeError} tone="danger" /> : null}

          <FormSection title="Datos de atencion">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Tipo de consulta"
                value={formulario.tipoConsulta}
                options={TIPOS_CONSULTA}
                onChange={(value) => handleInputChange("tipoConsulta", value)}
                error={errores.tipoConsulta}
                required
              />
              <Input
                label="Nombres del coordinador"
                value={formulario.coordinadorNombres}
                onChange={(value) => handleInputChange("coordinadorNombres", value)}
                error={errores.coordinadorNombres}
                placeholder="Escriba los nombres"
                required
              />
              <Input
                label="Apellidos del coordinador"
                value={formulario.coordinadorApellidos}
                onChange={(value) => handleInputChange("coordinadorApellidos", value)}
                error={errores.coordinadorApellidos}
                placeholder="Escriba los apellidos"
                required
              />
              <Input
                label="Nombres del alumno"
                value={formulario.alumnoNombres}
                onChange={(value) => handleInputChange("alumnoNombres", value)}
                error={errores.alumnoNombres}
                placeholder="Escriba los nombres"
                required
              />
              <Input
                label="Apellidos del alumno"
                value={formulario.alumnoApellidos}
                onChange={(value) => handleInputChange("alumnoApellidos", value)}
                error={errores.alumnoApellidos}
                placeholder="Escriba los apellidos"
                required
              />
            </div>
          </FormSection>

          <FormSection title="Segmento de la consulta">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Fecha"
                type="date"
                value={formulario.fechaConsulta}
                onChange={(value) => handleInputChange("fechaConsulta", value)}
                error={errores.fechaConsulta}
                required
              />
              <div className="grid gap-1">
                <AcademicCycleFields
                  value={formulario.ciclo}
                  onChange={(value) => handleInputChange("ciclo", value)}
                  required
                />
                {errores.ciclo ? <span className="text-xs font-medium text-red-600">{errores.ciclo}</span> : null}
              </div>
              <Input
                label="Nombre de la carrera"
                value={formulario.carrera}
                onChange={(value) => handleInputChange("carrera", value)}
                error={errores.carrera}
                placeholder="Escriba la carrera"
                required
              />
              <div className="grid gap-2">
                <Input
                  label="Nombre de la materia"
                  value={formulario.materia}
                  onChange={(value) => handleInputChange("materia", value)}
                  error={errores.materia}
                  placeholder="Escriba la materia"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleInputChange("materia", "SIN ASIGNAR")}
                  className="w-fit rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
                >
                  Materia: SIN ASIGNAR
                </button>
              </div>
            </div>
          </FormSection>

          <FormSection title="Seguimiento de la consulta">
            <Textarea
              label="Consulta"
              value={formulario.consulta}
              onChange={(value) => handleInputChange("consulta", value)}
              error={errores.consulta}
              rows={5}
              required
            />
            <Textarea
              label="Respuesta"
              value={formulario.respuesta}
              onChange={(value) => handleInputChange("respuesta", value)}
              error={errores.respuesta}
              rows={5}
              required
            />
          </FormSection>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelar}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "Guardando..." : "Registrar consulta"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="grid gap-4">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, error, required = false, placeholder = "Escriba la respuesta", type = "text" }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <input
        type={type}
        className={`rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function Select({ label, value, options, onChange, error, required = false }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <select
        className={`rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Seleccione una opcion</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function Textarea({ label, value, onChange, error, rows = 4, required = false }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <textarea
        className={`resize-y rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Escriba la informacion correspondiente"
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function Toast({ title, detail, tone }) {
  const palettes = {
    success: ["border-green-200 bg-green-50 text-green-800", "text-green-700"],
    warning: ["border-amber-200 bg-amber-50 text-amber-800", "text-amber-700"],
    danger: ["border-red-200 bg-red-50 text-red-800", "text-red-700"],
  };
  const [palette, detailPalette] = palettes[tone] ?? palettes.warning;

  return (
    <div className={`rounded-xl border px-4 py-3 ${palette}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className={`mt-1 text-xs ${detailPalette}`}>{detail}</p>
    </div>
  );
}
