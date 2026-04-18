import { useEffect, useState } from "react";
import { createHorarioUseCase, getHorarioFormOptions, listHorarios } from "../../application/horarios/horarioUseCases.js";

export function HorarioCreateModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({ grupos: [], aulas: [], dias: [] });

  const [formData, setFormData] = useState({
    id_grup: "",
    id_aula: "",
    dia: "",
    hora_inicio: "",
    hora_fin: "",
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true);
        setError("");
        const data = await getHorarioFormOptions();
        setOptions({
          grupos: data.grupos || [],
          aulas: data.aulas || [],
          dias: data.dias || [],
        });
      } catch (loadError) {
        setError(loadError.message || "No se pudieron cargar las opciones.");
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.id_grup) { setError("Seleccione un grupo."); return; }
    if (!formData.dia) { setError("Seleccione un día."); return; }
    if (!formData.hora_inicio) { setError("Ingrese la hora de inicio."); return; }
    if (!formData.hora_fin) { setError("Ingrese la hora de fin."); return; }
    if (formData.hora_inicio >= formData.hora_fin) {
      setError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result = await createHorarioUseCase({
        id_grup: parseInt(formData.id_grup),
        id_aula: formData.id_aula ? parseInt(formData.id_aula) : null,
        dia: formData.dia,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
      });

      window.alert(result.message || "Horario creado exitosamente.");
      onSuccess?.();
      onClose?.();
    } catch (submitError) {
      setError(submitError.message || "No se pudo crear el horario.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-slate-800">Crear nuevo horario</h2>

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
              <span className="text-sm font-medium text-slate-700">Grupo *</span>
              <select
                name="id_grup"
                value={formData.id_grup}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              >
                <option value="">Seleccione un grupo</option>
                {options.grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre} — {g.materia || "Sin materia"} ({g.catedratico || "Sin catedrático"})
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Aula</span>
              <select
                name="id_aula"
                value={formData.id_aula}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              >
                <option value="">Sin aula asignada</option>
                {options.aulas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}{a.capacidad ? ` (cap. ${a.capacidad})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Día *</span>
              <select
                name="dia"
                value={formData.dia}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                disabled={submitting}
              >
                <option value="">Seleccione un día</option>
                {options.dias.map((dia) => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Hora inicio *</span>
                <input
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                  disabled={submitting}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Hora fin *</span>
                <input
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500"
                  disabled={submitting}
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Creando..." : "Crear horario"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
