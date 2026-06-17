import { useNavigate } from "react-router-dom";

const ICON_ALIASES = {
  add: "create",
  add_box: "create",
  cached: "edit",
  edit: "edit",
  modify: "edit",
  print: "print",
  print_connect: "print",
};

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
                    ? `flex h-[220px] w-[260px] flex-col items-center justify-center gap-4 rounded-xl border border-transparent px-8 py-8 text-lg font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${accion.buttonClassName}`
                    : "flex h-[220px] w-[260px] flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white px-8 py-8 text-lg font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                }
              >
                {accion.icon && (
                  <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                    <ActionIcon name={accion.icon} className="h-12 w-12" />
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

function ActionIcon({ name, className }) {
  const iconName = ICON_ALIASES[name] ?? name;

  if (iconName === "create") {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M18 8h20l12 12v34a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M38 8v14h12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 30v16M24 38h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (iconName === "edit") {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M16 48h10l27-27a7 7 0 0 0-10-10L16 38v10Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="m38 16 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M14 56h38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 42h8v8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (iconName === "print") {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M20 24V10h24v14" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M20 46H14a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-6" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M20 38h24v18H20V38Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        <path d="M45 34h1" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="4" />
      <path d="M32 20v14l9 6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
