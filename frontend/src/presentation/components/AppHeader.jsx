import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navRoutes } from "../routes.js";
import logo from "../../assets/images/LOGO_USO.png";
import usuariosIcon from "../../assets/images/usoUsuarios.png";

export function AppHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const headerButtons = navRoutes;
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  function handleGoProfile() {
    setIsProfileMenuOpen(false);
    navigate("/usuario");
  }

  function handleLogout() {
    setIsProfileMenuOpen(false);
    onLogout();
  }

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
                  ? "inline-flex min-w-24 flex-col items-center justify-center gap-1 rounded-lg border border-amber-400 bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-amber-100"
                  : "inline-flex min-w-24 flex-col items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900"
              }
            >
              {item.icon ? (
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className={`h-12 w-12 object-contain ${item.iconClassName ?? ""}`}
                />
              ) : item.iconName ? (
                <span
                  className={`material-symbols-outlined flex h-12 w-12 items-center justify-center text-slate-600 ${item.iconClassName ?? ""}`}
                  style={{ fontSize: "2.25rem" }}
                  aria-hidden="true"
                >
                  {item.iconName}
                </span>
              ) : null}
              <span className="leading-tight">{item.label}</span>
            </NavLink>
          ))}

          <div className="relative ml-0 sm:ml-6">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="inline-flex min-w-24 flex-col items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-slate-900"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
              title={user?.nombre || user?.username || "Perfil"}
            >
              <img src={usuariosIcon} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
              <span className="leading-tight">Perfil</span>
            </button>

            {isProfileMenuOpen ? (
              <div
                className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                role="menu"
              >
                <button
                  type="button"
                  onClick={handleGoProfile}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  Perfil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                  role="menuitem"
                >
                  Salir
                </button>
              </div>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
