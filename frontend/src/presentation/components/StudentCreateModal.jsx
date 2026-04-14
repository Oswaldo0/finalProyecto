import { useEffect, useState } from "react";

const initialForm = {
  expediente: "",
  nombres: "",
  apellidos: "",
  cum: "",
  num_carnet: "",
  calidad: "",
  id_direccion: "",
  telefono: "",
  correo: "",
  id_carrera: "",
  edad: "",
  fecha_nac: "",
  id_responsable: "",
  estado_academico: "",
  institucion_proc: "",
  anio_ingreso: "",
  id_ciclo: "",
  id_grupo: "",
  id_plan_estu: "",
  empleo: "",
};

export function StudentCreateModal({ open, onClose, onCreated }) {
  const [options, setOptions] = useState({
    direcciones: [],
    carreras: [],
    responsables: [],
    ciclos: [],
    grupos: [],
    planes: [],
  });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadOptions() {
      try {
        setError("");
        const response = await fetch("/api/estudiantes/form-options");
        if (!response.ok) {
          throw new Error("No se pudieron cargar las opciones del formulario.");
        }

        const result = await response.json();
        if (!cancelled) {
          setOptions(result);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/estudiantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear el estudiante.");
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
      <form className="h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl" onSubmit={handleSubmit}>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Nuevo estudiante</h3>
        <p className="mt-1 text-sm text-slate-600">Complete los datos del estudiante para crear un registro en MySQL.</p>

        {error ? <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="expediente" required>
            <input value={form.expediente} onChange={(e) => updateField("expediente", e.target.value)} required className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="num_carnet">
            <input value={form.num_carnet} onChange={(e) => updateField("num_carnet", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="nombres" required>
            <input value={form.nombres} onChange={(e) => updateField("nombres", e.target.value)} required className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="apellidos" required>
            <input value={form.apellidos} onChange={(e) => updateField("apellidos", e.target.value)} required className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="correo">
            <input type="email" value={form.correo} onChange={(e) => updateField("correo", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="telefono">
            <input value={form.telefono} onChange={(e) => updateField("telefono", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="cum">
            <input type="number" step="0.01" value={form.cum} onChange={(e) => updateField("cum", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="edad">
            <input type="number" value={form.edad} onChange={(e) => updateField("edad", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="fecha_nac">
            <input type="date" value={form.fecha_nac} onChange={(e) => updateField("fecha_nac", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="anio_ingreso">
            <input type="number" value={form.anio_ingreso} onChange={(e) => updateField("anio_ingreso", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="calidad">
            <input value={form.calidad} onChange={(e) => updateField("calidad", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="estado_academico">
            <input value={form.estado_academico} onChange={(e) => updateField("estado_academico", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="institucion_proc">
            <input value={form.institucion_proc} onChange={(e) => updateField("institucion_proc", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>
          <Field label="empleo">
            <input value={form.empleo} onChange={(e) => updateField("empleo", e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" />
          </Field>

          <SelectField label="id_direccion" value={form.id_direccion} onChange={(value) => updateField("id_direccion", value)} options={options.direcciones} textKey="direccion" />
          <SelectField label="id_carrera" value={form.id_carrera} onChange={(value) => updateField("id_carrera", value)} options={options.carreras} textKey="nombre" />
          <SelectField label="id_responsable" value={form.id_responsable} onChange={(value) => updateField("id_responsable", value)} options={options.responsables} textKey="nombre" />
          <SelectField label="id_ciclo" value={form.id_ciclo} onChange={(value) => updateField("id_ciclo", value)} options={options.ciclos} textKey="nombre" />
          <SelectField label="id_grupo" value={form.id_grupo} onChange={(value) => updateField("id_grupo", value)} options={options.grupos} textKey="grupo" />
          <SelectField label="id_plan_estu" value={form.id_plan_estu} onChange={(value) => updateField("id_plan_estu", value)} options={options.planes} textKey="plan_de_estudio" />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Guardando..." : "Guardar estudiante"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}{required ? " *" : ""}</span>
      {children}
    </label>
  );
}

function SelectField({ label, value, onChange, options, textKey }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
        <option value="">Sin seleccionar</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option[textKey]}</option>
        ))}
      </select>
    </label>
  );
}
