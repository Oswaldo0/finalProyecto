import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navRoutes } from "../routes.js";
import logo from "../../assets/images/LOGO_USO.png";

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
                  ? "rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="relative ml-0 sm:ml-6">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="inline-flex max-w-[210px] items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
            >
              <span className="truncate">{user?.nombre || user?.username || "Perfil"}</span>
              <span className="text-xs text-slate-500">Perfil</span>
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
