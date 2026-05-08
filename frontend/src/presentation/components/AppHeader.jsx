import { NavLink } from "react-router-dom";
import { navRoutes } from "../routes.js";
import logo from "../../assets/images/LOGO_USO.png";

export function AppHeader() {
  const headerButtons = navRoutes;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-3 sm:flex-row sm:justify-between sm:px-6">
        <div className="min-w-0">
          <img src={logo} alt="universidad_sonsonate" className="h-12 w-auto" />
        </div>

        <nav
          aria-label="Navegacion principal"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {headerButtons.map((item) => (
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

          <NavLink
            to="/usuario"
            className={({ isActive }) =>
              isActive
                ? "ml-6 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                : "ml-6 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            }
          >
            Usuario
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
