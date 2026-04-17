import { useEffect, useMemo, useState } from "react";
import {
  createStudentUseCase,
  getEditableStudent,
  getStudentFormOptions,
  updateStudentUseCase,
} from "../../application/students/studentUseCases.js";

const initialForm = {
  expediente: "",
  nombre: "",
  apellido: "",
  cum: "0",
  calidad: "",
  year_ingreso: "",
  id_plan_estu: "",
  telefono: "",
  correo: "",
  direccion: "",
  id_departamento: "",
  id_municipio: "",
};

export function StudentCreateModal({
  open,
  onClose,
  onCreated,
  mode = "create",
  expediente = "",
}) {
  const [options, setOptions] = useState({
    departamentos: [],
    municipios: [],
    carreras: [],
    facultades: [],
    ciclos: [],
    planes: [],
  });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Municipios filtrados según departamento seleccionado
  const filteredMunicipios = useMemo(() => {
    if (!form.id_departamento) return [];
    return options.municipios.filter(
      (m) => String(m.id_departamento) === String(form.id_departamento),
    );
  }, [form.id_departamento, options.municipios]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadData() {
      try {
        setError("");
        if (mode === "create") setForm(initialForm);

        const result = await getStudentFormOptions();
        if (!cancelled) setOptions(result);

        if (mode === "edit" && expediente) {
          const studentResult = await getEditableStudent(expediente);
          if (!cancelled) {
            setForm((current) => ({
              ...current,
              ...studentResult.student,
            }));
          }
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [open, mode, expediente]);

  if (!open) return null;

  function updateField(field, value) {
    if (field === "id_departamento") {
      setForm((current) => ({ ...current, id_departamento: value, id_municipio: "" }));
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError("");

      const cumValue = Number(form.cum);
      if (!Number.isNaN(cumValue) && cumValue < 0) {
        throw new Error("El campo cum no permite valores negativos.");
      }

      if (mode === "edit") {
        await updateStudentUseCase(expediente, form);
      } else {
        await createStudentUseCase(form);
      }

      setForm(initialForm);
      onCreated();
      onClose();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-3 py-4">
      <form
        className="h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {mode === "edit" ? "Editar estudiante" : "Nuevo estudiante"}
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          {mode === "edit"
            ? "Modifique los datos del estudiante seleccionado y guarde los cambios."
            : "Complete los datos del estudiante para crear un nuevo registro."}
        </p>

        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {/* Secci�n: Datos acad�micos */}
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Datos acad�micos
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Expediente" required>
            <input
              value={form.expediente}
              onChange={(e) => updateField("expediente", e.target.value)}
              required
              disabled={mode === "edit"}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500 disabled:bg-slate-50"
            />
          </Field>

          <Field label="CUM">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.cum}
              onChange={(e) => updateField("cum", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            />
          </Field>

          <Field label="Calidad">
            <input
              value={form.calidad}
              onChange={(e) => updateField("calidad", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
              placeholder="Ej. Regular, Becado..."
            />
          </Field>

          <Field label="A�o de ingreso">
            <input
              type="number"
              min="2000"
              max="2100"
              value={form.year_ingreso}
              onChange={(e) => updateField("year_ingreso", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
              placeholder={String(new Date().getFullYear())}
            />
          </Field>

          <SelectField
            label="Plan de estudio"
            value={form.id_plan_estu}
            onChange={(value) => updateField("id_plan_estu", value)}
            options={options.planes}
            placeholder="Seleccione plan..."
          />
        </div>

        {/* Secci�n: Datos personales */}
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Datos personales
        </p>
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Nombre" required>
            <input
              value={form.nombre}
              onChange={(e) => updateField("nombre", e.target.value)}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            />
          </Field>

          <Field label="Apellido" required>
            <input
              value={form.apellido}
              onChange={(e) => updateField("apellido", e.target.value)}
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            />
          </Field>

          <Field label="Correo">
            <input
              type="email"
              value={form.correo}
              onChange={(e) => updateField("correo", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            />
          </Field>

          <Field label="Tel�fono">
            <input
              value={form.telefono}
              onChange={(e) => updateField("telefono", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            />
          </Field>

          <Field label="Direcci�n" className="md:col-span-2">
            <input
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
              placeholder="Calle, avenida, número de casa…"
            />
          </Field>

          <Field label="Departamento">
            <select
              value={form.id_departamento}
              onChange={(e) => updateField("id_departamento", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
            >
              <option value="">— Seleccione —</option>
              {options.departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Municipio">
            <select
              value={form.id_municipio}
              onChange={(e) => updateField("id_municipio", e.target.value)}
              disabled={!form.id_departamento}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {form.id_departamento ? "— Seleccione —" : "Elija primero un departamento"}
              </option>
              {filteredMunicipios.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Guardando..."
              : mode === "edit"
                ? "Guardar cambios"
                : "Guardar estudiante"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required = false, className = "", children }) {
  return (
    <label className={`grid gap-1 text-sm ${className}`}>
      <span className="font-medium text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "Seleccione..." }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
