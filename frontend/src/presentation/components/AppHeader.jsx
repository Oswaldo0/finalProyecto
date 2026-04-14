import { NavLink } from "react-router-dom";
import { navRoutes } from "../routes.js";

const USER_MENU_ITEMS = ["Usuario", "Modulos mantenimiento", "Modo coordinador", "Salir"];

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="min-w-0 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plataforma Academica</p>
          <h1 className="text-base font-bold text-slate-800 sm:text-lg">Panel de Gestion</h1>
        </div>

        <nav aria-label="Navegacion principal" className="flex flex-wrap items-center justify-center gap-2">
          {navRoutes.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex justify-center lg:justify-end">
          <details className="group relative">
            <summary className="list-none rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              Usuario
            </summary>

            <div className="mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg lg:absolute lg:right-0 lg:mt-3">
              <ul className="flex flex-col gap-1" aria-label="Menu de usuario">
                {USER_MENU_ITEMS.map((item) => (
                  <li key={item}>
                    <a className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100" href="#">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
