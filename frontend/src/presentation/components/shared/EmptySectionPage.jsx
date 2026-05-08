export function EmptySectionPage({ title }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">{title}</h2>
        <div className="mt-4 min-h-[70vh] rounded-2xl border border-dashed border-slate-300 bg-white" />
      </section>
    </main>
  );
}
