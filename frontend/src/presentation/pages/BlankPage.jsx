import { useState } from "react";
import { StudentCreateModal } from "../components/StudentCreateModal.jsx";
import { StudentDataViewer } from "../components/StudentDataViewer.jsx";

export function BlankPage({ title }) {
  const usesMainLayout = title === "Inicio" || title === "Estudiantes";
  const isStudentsPage = title === "Estudiantes";
  const [showStudentLogin, setShowStudentLogin] = useState(false);
  const [studentActionsUnlocked, setStudentActionsUnlocked] = useState(false);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [studentViewerRefreshToken, setStudentViewerRefreshToken] = useState(0);

  function handleStudentLoginSubmit(event) {
    event.preventDefault();
    setStudentActionsUnlocked(true);
    setShowStudentLogin(false);
  }

  return (
    <main
      className={`mx-auto flex w-full max-w-6xl flex-col gap-4 p-3 sm:p-6 ${usesMainLayout ? "min-h-[calc(100vh-88px)]" : ""}`}
      aria-label={`Pagina ${title}`}
    >
      <section
        className={`rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm sm:p-6 ${
          usesMainLayout ? "min-h-[calc(100vh-128px)]" : "min-h-[420px]"
        }`}
      >
        {usesMainLayout ? (
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,_1fr)] lg:grid-rows-[minmax(110px,_auto)_minmax(0,_1fr)]">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
              {isStudentsPage ? (
                <>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                      onClick={() => setShowStudentLogin(true)}
                    >
                      Cambios
                    </button>
                    {[
                      "Nuevo",
                      "Actualizar",
                      "Eliminar",
                      "Reactivar",
                    ].map((action) => (
                      <button
                        key={action}
                        type="button"
                        disabled={!studentActionsUnlocked}
                        onClick={action === "Nuevo" ? () => setShowCreateStudentModal(true) : undefined}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                          studentActionsUnlocked
                            ? "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                            : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-80"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    Horario de Clases
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    Calendario
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                  >
                    Grupos
                  </button>
                </div>
              )}
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Filtro
              </h3>

              <form className="mt-4 grid gap-3" aria-label="Filtros de inicio">
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Facultad</span>
                  <select className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500">
                    <option value="">Seleccione facultad</option>
                  </select>
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Materias</span>
                  <select className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500">
                    <option value="">Seleccione materia</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="mt-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Aceptar
                </button>
              </form>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {isStudentsPage ? (
                <StudentDataViewer refreshToken={studentViewerRefreshToken} />
              ) : (
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Division vertical 2
                </h3>
              )}
            </article>
          </div>
        ) : (
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        )}
      </section>

      {isStudentsPage && showStudentLogin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-3">
          <form
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            aria-label="Login de cambios de estudiantes"
            onSubmit={handleStudentLoginSubmit}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Login de acceso</h3>
            <p className="mt-1 text-sm text-slate-600">Ingrese sus credenciales para habilitar acciones de mantenimiento.</p>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Usuario</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
                  placeholder="Ingrese su usuario"
                  required
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Contrasena</span>
                <input
                  type="password"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none focus:border-slate-500"
                  placeholder="Ingrese su contrasena"
                  required
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setShowStudentLogin(false)}
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

      {isStudentsPage ? (
        <StudentCreateModal
          open={showCreateStudentModal}
          onClose={() => setShowCreateStudentModal(false)}
          onCreated={() => setStudentViewerRefreshToken((value) => value + 1)}
        />
      ) : null}
    </main>
  );
}
