import { useState } from "react";
import { StudentCreateModal } from "../components/StudentCreateModal.jsx";
import { StudentDataViewer } from "../components/StudentDataViewer.jsx";

export function BlankPage({ title }) {
  const usesMainLayout =
    title === "Inicio" || title === "Estudiantes" || title === "Facultades" || title === "Planeación" || title === "Solicitudes";
  const isHomePage = title === "Inicio";
  const isStudentsPage = title === "Estudiantes";
  const isFacultiesPage = title === "Facultades";
  const isPlanningPage = title === "Planeación";
  const isRequestsPage = title === "Solicitudes";
  const isReportsPage = title === "Reportes";
  const [activePlanningAction, setActivePlanningAction] = useState(null);
  const [activeRequest, setActiveRequest] = useState("Pendientes");
  const [activeReport, setActiveReport] = useState("Visualizar");
  const [showStudentLogin, setShowStudentLogin] = useState(false);
  const [studentActionsUnlocked, setStudentActionsUnlocked] = useState(false);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudentExpediente, setSelectedStudentExpediente] = useState("");
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
          isRequestsPage ? (
            <div className="flex h-full flex-col gap-4 lg:flex-row">
              {/* Columna izquierda */}
              <article className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:w-[340px] lg:shrink-0">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Filtro</h3>
                <form className="mt-4 grid gap-3" aria-label="Filtros de solicitudes">
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

              {/* Columna derecha: dos filas */}
              <div className="flex flex-1 flex-col gap-4">
                {/* Fila superior: botones */}
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex gap-3">
                    {["Pendientes", "Resueltas"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveRequest(tab)}
                        className={`rounded-lg border px-5 py-2 text-sm font-semibold transition ${
                          activeRequest === tab
                            ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
                            : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </article>

                {/* Fila inferior: contenido */}
                <article className="flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                    {activeRequest === "Pendientes"
                      ? "Listado de solicitudes pendientes."
                      : "Listado de solicitudes resueltas."}
                  </div>
                </article>
              </div>
            </div>
          ) : (
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,_1fr)] lg:grid-rows-[minmax(110px,_auto)_minmax(0,_1fr)]">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
              {!isReportsPage ? (
                <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
              ) : null}
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
                    {["Nuevo", "Actualizar", "Eliminar", "Reactivar"].map(
                      (action) => (
                        <button
                          key={action}
                          type="button"
                          disabled={
                            !studentActionsUnlocked ||
                            (action === "Actualizar" && !selectedStudentExpediente)
                          }
                          onClick={() => {
                            if (action === "Nuevo") {
                              setShowCreateStudentModal(true);
                              return;
                            }

                            if (
                              action === "Actualizar" &&
                              selectedStudentExpediente
                            ) {
                              setShowEditStudentModal(true);
                            }
                          }}
                          className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                            studentActionsUnlocked &&
                            !(action === "Actualizar" && !selectedStudentExpediente)
                              ? "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-80"
                          }`}
                        >
                          {action}
                        </button>
                      ),
                    )}
                  </div>
                </>
              ) : isFacultiesPage ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {["Materias", "Grupos", "Laboratorios"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              ) : isPlanningPage ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {["Crear grupos", "Crear horarios", "Crear Laboratorio"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() =>
                        setActivePlanningAction((prev) =>
                          prev === action ? null : action
                        )
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                        activePlanningAction === action
                          ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
                          : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
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

            {!isHomePage && !isPlanningPage ? (
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Filtro
                </h3>

                <form
                  className="mt-4 grid gap-3"
                  aria-label={`Filtros de ${title.toLowerCase()}`}
                >
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">Facultad</span>
                    <select className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500">
                      <option value="">Seleccione facultad</option>
                    </select>
                  </label>

                  {!isFacultiesPage ? (
                    <label className="grid gap-1 text-sm">
                      <span className="font-medium text-slate-700">Materias</span>
                      <select className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500">
                        <option value="">Seleccione materia</option>
                      </select>
                    </label>
                  ) : null}

                  <button
                    type="button"
                    className="mt-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Aceptar
                  </button>
                </form>
              </article>
            ) : null}

            <article
              className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
                isHomePage || isPlanningPage ? "lg:col-span-2" : ""
              }`}
            >
              {isStudentsPage ? (
                <StudentDataViewer
                  refreshToken={studentViewerRefreshToken}
                  selectedExpediente={selectedStudentExpediente}
                  onSelectStudent={setSelectedStudentExpediente}
                />
              ) : isFacultiesPage ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Datos de facultades
                  </h3>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                    Esta seccion queda preparada para integrar el listado y
                    mantenimiento de facultades.
                  </div>
                </div>
              ) : isPlanningPage ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {activePlanningAction ?? "Planeación"}
                  </h3>
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                    {activePlanningAction
                      ? `Sección de "${activePlanningAction}" lista para integrarse.`
                      : "Seleccione una acción para continuar."}
                  </div>
                </div>
              ) : (
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Division vertical 2
                </h3>
              )}
            </article>
          </div>
          )
        ) : isReportsPage ? (
          <div className="flex h-full flex-col gap-4">
            {/* Fila superior: botones */}
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveReport("Visualizar")}
                  className={`rounded-lg border px-5 py-2 text-sm font-semibold transition ${
                    activeReport === "Visualizar"
                      ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  Visualizar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport("Crear reportes")}
                  className={`rounded-lg border px-5 py-2 text-sm font-semibold transition ${
                    activeReport === "Crear reportes"
                      ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
                      : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  Crear reportes
                </button>
              </div>
            </article>

            {/* Fila inferior: contenido */}
            <article className="flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                {activeReport === "Visualizar"
                  ? "Sección para visualizar reportes."
                  : "Sección para crear reportes."}
              </div>
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Login de acceso
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Ingrese sus credenciales para habilitar acciones de mantenimiento.
            </p>

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

      {isStudentsPage ? (
        <StudentCreateModal
          open={showEditStudentModal}
          mode="edit"
          expediente={selectedStudentExpediente}
          onClose={() => setShowEditStudentModal(false)}
          onCreated={() => setStudentViewerRefreshToken((value) => value + 1)}
        />
      ) : null}
    </main>
  );
}
