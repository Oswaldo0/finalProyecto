import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function CrearPenalidadPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/penalidad");
    }, 1200);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">Crear penalidad</h2>

        <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario crear penalidad">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Para (Nombre del Secretario)</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del Secretario" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">De (Nombre del Decano)</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del Decano" required />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Fecha</span>
              <input type="date" className="rounded-lg border border-slate-300 px-3 py-2" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Cantidad de años de egreso</span>
              <input type="number" min="0" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. 6" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Ciclo de reingreso</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. I-2026" required />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre del alumno</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del alumno" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre de la carrera</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre de la carrera" required />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Mes de egreso</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. Noviembre" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Año de egreso</span>
              <input type="number" min="1900" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. 2019" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Años de egresado</span>
              <input type="number" min="0" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. 6" required />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas a cursar</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px]">
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Asignatura 1" />
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="UV" />
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Asignatura 2" />
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="UV" />
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Asignatura 3" />
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="UV" />
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Asignatura 4" />
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="UV" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelAction}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
              Guardar penalidad
            </button>
          </div>
        </form>
      </section>

      {showCancelNotice ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-800">Se ha cancelado esta acción</p>
          <p className="mt-1 text-xs text-amber-700">Redirigiendo a Penalidad...</p>
        </div>
      ) : null}
    </main>
  );
}
