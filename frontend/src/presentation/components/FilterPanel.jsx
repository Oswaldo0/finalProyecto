export function FilterPanel() {
  return (
    <section
      className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label="Filtro"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Filtro
      </h2>
      <div className="grid gap-2">
        <label
          htmlFor="student-id"
          className="text-sm font-medium text-slate-700"
        >
          Carnet de estudiante
        </label>
        <input
          id="student-id"
          type="text"
          placeholder="Ej: 20261234"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-600"
        />
      </div>
    </section>
  );
}
