import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function SectionPage({ titulo, acciones, baseRoute }) {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [loginData, setLoginData] = useState({ usuario: "", password: "", facultad: "" });

  function handleOpenLogin(action) {
    setSelectedAction(action);
    setShowLogin(true);
  }

  function handleCloseLogin() {
    setShowLogin(false);
    setSelectedAction("");
    setLoginData({ usuario: "", password: "", facultad: "" });
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const targetRoute = acciones.find((a) => a.label === selectedAction)?.route ?? baseRoute;
    handleCloseLogin();
    navigate(targetRoute);
  }

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
                onClick={() => handleOpenLogin(accion.label)}
                className={
                  accion.buttonClassName
                    ? `flex h-[220px] w-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-black px-8 py-8 text-lg font-semibold shadow-sm transition ${accion.buttonClassName}`
                    : "flex h-[220px] w-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-black bg-white px-8 py-8 text-lg font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                }
              >
                {accion.icon && (
                  <span className="material-symbols-outlined" style={{ fontSize: "4rem" }}>{accion.icon}</span>
                )}
                {accion.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {showLogin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-3">
          <form
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            aria-label={`Login de ${titulo}`}
            onSubmit={handleLoginSubmit}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Acceso a {selectedAction}
            </h3>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Usuario</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
                  placeholder="Ingrese su usuario"
                  value={loginData.usuario}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, usuario: e.target.value }))}
                  required
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
                  placeholder="Ingrese su password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Facultad</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
                  value={loginData.facultad}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, facultad: e.target.value }))}
                  required
                >
                  <option value="">Seleccione facultad</option>
                  <option value="Ingenieria">Ingenieria</option>
                  <option value="Humanidades">Humanidades</option>
                  <option value="Ciencias">Ciencias</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={handleCloseLogin}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Ingresar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
