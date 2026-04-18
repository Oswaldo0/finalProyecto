import { useEffect, useMemo, useState } from "react";
import {
  createCatedraticUseCase,
  getCatedraticFormOptions,
  listCatedraticos,
} from "../../application/catedraticos/catedraticUseCases.js";

const EMPTY_FORM = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  id_facultad: "",
  tip_contrato: "",
  direccion: "",
  id_departamento: "",
  id_municipio: "",
};

export function CatedraticPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [catedraticos, setCatedraticos] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showList, setShowList] = useState(false);
  const [options, setOptions] = useState({ departamentos: [], municipios: [], facultades: [] });

  useEffect(() => {
    getCatedraticFormOptions()
      .then((data) => setOptions(data))
      .catch(() => {});
  }, []);

  const filteredMunicipios = useMemo(() => {
    if (!form.id_departamento) return [];
    return options.municipios.filter(
      (m) => String(m.id_departamento) === String(form.id_departamento),
    );
  }, [form.id_departamento, options.municipios]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "id_departamento") {
      setForm((prev) => ({ ...prev, id_departamento: value, id_municipio: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    try {
      const data = await createCatedraticUseCase({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        id_facultad: form.id_facultad || undefined,
        tip_contrato: form.tip_contrato.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        id_departamento: form.id_departamento || undefined,
        id_municipio: form.id_municipio || undefined,
      });

      setFeedback({ type: "success", message: data.message || "Catedrático creado correctamente." });
      setForm(EMPTY_FORM);
      if (showList) handleLoadList();
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "No se pudo crear el catedrático." });
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadList() {
    setLoadingList(true);
    try {
      const data = await listCatedraticos(50);
      setCatedraticos(data.rows || []);
      setShowList(true);
    } catch {
      setFeedback({ type: "error", message: "No se pudo cargar la lista de catedráticos." });
    } finally {
      setLoadingList(false);
    }
  }

  const inputClass =
    "rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100";
  const labelClass = "flex flex-col gap-1 text-sm";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Gestión de catedráticos</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Registrar nuevos catedráticos vinculados a una facultad.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadList}
          disabled={loadingList}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {loadingList ? "Cargando…" : "Ver catedráticos"}
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Datos personales
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              <span className="font-medium text-slate-600">
                Nombre <span className="text-red-500">*</span>
              </span>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength={250}
                placeholder="Ej. Carlos"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              <span className="font-medium text-slate-600">
                Apellido <span className="text-red-500">*</span>
              </span>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                maxLength={250}
                placeholder="Ej. Martínez"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              <span className="font-medium text-slate-600">Correo</span>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                maxLength={150}
                placeholder="correo@ejemplo.com"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              <span className="font-medium text-slate-600">Teléfono</span>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                maxLength={15}
                placeholder="Ej. 70001234"
                className={inputClass}
              />
            </label>
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Datos académicos
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              <span className="font-medium text-slate-600">Facultad</span>
              <select
                name="id_facultad"
                value={form.id_facultad}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">— Seleccione —</option>
                {options.facultades.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              <span className="font-medium text-slate-600">Tipo de contrato</span>
              <input
                name="tip_contrato"
                value={form.tip_contrato}
                onChange={handleChange}
                maxLength={100}
                placeholder="Ej. Tiempo completo, Hora clase…"
                className={inputClass}
              />
            </label>
          </div>

          <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Dirección
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>
              <span className="font-medium text-slate-600">Dirección</span>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                maxLength={250}
                placeholder="Calle, avenida, número…"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              <span className="font-medium text-slate-600">Departamento</span>
              <select
                name="id_departamento"
                value={form.id_departamento}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">— Seleccione —</option>
                {options.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              <span className="font-medium text-slate-600">Municipio</span>
              <select
                name="id_municipio"
                value={form.id_municipio}
                onChange={handleChange}
                disabled={!form.id_departamento}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
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
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => { setForm(EMPTY_FORM); setFeedback(null); }}
              className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar catedrático"}
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Catedráticos registrados
          </h2>

          {!showList ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              <p>Haga clic en "Ver catedráticos" para cargar el listado.</p>
            </div>
          ) : catedraticos.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              No hay catedráticos registrados.
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border border-slate-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    {["Nombre", "Apellido", "Correo", "Teléfono", "Facultad", "Contrato"].map((col) => (
                      <th
                        key={col}
                        className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {catedraticos.map((cat, i) => (
                    <tr key={cat.id || i} className="odd:bg-white even:bg-slate-50">
                      <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{cat.nombre}</td>
                      <td className="border-t border-slate-200 px-3 py-2 text-slate-700">{cat.apellido}</td>
                      <td className="border-t border-slate-200 px-3 py-2 text-slate-500">{cat.correo ?? "—"}</td>
                      <td className="border-t border-slate-200 px-3 py-2 text-slate-500">{cat.telefono ?? "—"}</td>
                      <td className="border-t border-slate-200 px-3 py-2 text-slate-500">{cat.facultad ?? "—"}</td>
                      <td className="border-t border-slate-200 px-3 py-2 text-slate-500">{cat.tip_contrato ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
