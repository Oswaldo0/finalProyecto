import { useEffect, useState } from "react";
import { createGroupUseCase, getGroupFormOptions } from "../../application/groups/groupUseCases.js";

export function GroupCreateModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    materias: [],
    catedraticos: [],
    ciclos: [],
    aulas: [],
  });

  const [formData, setFormData] = useState({
    nombre: "",
    id_mate: "",
    id_cate: "",
    id_cicl: "",
    grupo_max: 50,
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true);
        setError("");
        const data = await getGroupFormOptions();
        setOptions({
          materias: data.materias || [],
          catedraticos: data.catedraticos || [],
          ciclos: data.ciclos || [],
          aulas: data.aulas || [],
        });
      } catch (loadError) {
        setError(loadError.message || "No se pudieron cargar las opciones del formulario.");
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "grupo_max" ? parseInt(value) || 50 : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError("El nombre del grupo es requerido.");
      return;
    }
    if (!formData.id_mate) {
      setError("Seleccione una materia.");
      return;
    }
    if (!formData.id_cate) {
      setError("Seleccione un catedrático.");
      return;
    }
    if (!formData.id_cicl) {
      setError("Seleccione un ciclo académico.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const result = await createGroupUseCase({
        nombre: formData.nombre.trim(),
        id_mate: parseInt(formData.id_mate),
        id_cate: parseInt(formData.id_cate),
        id_cicl: parseInt(formData.id_cicl),
        grupo_max: formData.grupo_max || 50,
      });

      window.alert(result.message || "Grupo creado exitosamente.");
      onSuccess?.();
      onClose?.();
    } catch (submitError) {
      setError(submitError.message || "No se pudo crear el grupo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Crear nuevo grupo</h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-600">
            Cargando opciones del formulario...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Nombre del grupo *</span>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="A, B, 01, 02..."
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Materia *</span>
              <select
                name="id_mate"
                value={formData.id_mate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              >
                <option value="">Seleccione una materia</option>
                {options.materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.nombre} ({materia.carrera || "N/A"})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Catedrático *</span>
              <select
                name="id_cate"
                value={formData.id_cate}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              >
                <option value="">Seleccione un catedrático</option>
                {options.catedraticos.map((catedratico) => (
                  <option key={catedratico.id} value={catedratico.id}>
                    {catedratico.nombre} {catedratico.apellido} ({catedratico.facultad || "N/A"})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Ciclo académico *</span>
              <select
                name="id_cicl"
                value={formData.id_cicl}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              >
                <option value="">Seleccione un ciclo académico</option>
                {options.ciclos.map((ciclo) => (
                  <option key={ciclo.id} value={ciclo.id}>
                    {ciclo.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Capacidad máxima</span>
              <input
                type="number"
                name="grupo_max"
                value={formData.grupo_max}
                onChange={handleChange}
                min="1"
                max="200"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              />
            </label>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:opacity-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                disabled={submitting || loading}
              >
                {submitting ? "Creando..." : "Crear grupo"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
