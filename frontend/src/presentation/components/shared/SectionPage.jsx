import { useNavigate } from "react-router-dom";

export function SectionPage({ titulo, acciones, baseRoute }) {
  const navigate = useNavigate();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">{titulo}</h2>

        <div className="mt-4 flex min-h-[70vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex w-full max-w-4xl flex-row flex-wrap items-stretch justify-center gap-5">
            {acciones.map((accion) => (
              <button
                key={accion.label}
                type="button"
                onClick={() => navigate(accion.route ?? baseRoute)}
                className={
                  accion.buttonClassName
                    ? `flex h-[220px] w-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-black px-8 py-8 text-lg font-semibold shadow-sm transition ${accion.buttonClassName}`
                    : "flex h-[220px] w-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-black bg-white px-8 py-8 text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                }
              >
                {accion.icon && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "4rem" }}
                  >
                    {accion.icon}
                  </span>
                )}
                {accion.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
