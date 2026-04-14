const ACTIONS = ["Horario de clase", "Grupos", "Materias"];

export function ActionButtons() {
  return (
    <section className="text-center" aria-label="Acciones principales">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Modulos</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((label) => (
          <button
            key={label}
            type="button"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
