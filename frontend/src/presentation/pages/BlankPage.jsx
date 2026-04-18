import { useEffect, useState } from "react";
import { StudentCreateModal } from "../components/StudentCreateModal.jsx";
import { StudentDataViewer } from "../components/StudentDataViewer.jsx";
import { GroupCreateModal } from "../components/GroupCreateModal.jsx";
import { GroupDataViewer } from "../components/GroupDataViewer.jsx";
import { HorarioCreateModal } from "../components/HorarioCreateModal.jsx";
import { HorarioDataViewer } from "../components/HorarioDataViewer.jsx";
import { deleteStudentUseCase } from "../../application/students/studentUseCases.js";
import { listWeeklySchedule } from "../../application/schedules/scheduleUseCases.js";

const HOME_DAYS = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

const EMPTY_HOME_SCHEDULE = Object.fromEntries(HOME_DAYS.map((day) => [day, []]));

export function BlankPage({ title }) {
  const usesMainLayout =
    title === "Inicio" ||
    title === "Estudiantes" ||
    title === "Facultades" ||
    title === "Planeación" ||
    title === "Solicitudes" ||
    title === "Modo coordinador";
  const isHomePage = title === "Inicio";
  const isStudentsPage = title === "Estudiantes";
  const isFacultiesPage = title === "Facultades";
  const isPlanningPage = title === "Planeación";
  const isRequestsPage = title === "Solicitudes";
  const isCoordinatorPage = title === "Modo coordinador";
  const isReportsPage = title === "Reportes";
  const [activePlanningAction, setActivePlanningAction] = useState(null);
  const [activeRequest, setActiveRequest] = useState("Pendientes");
  const [activeReport, setActiveReport] = useState("Visualizar");
  const [activeHomeAction, setActiveHomeAction] = useState("Horario de Clases");
  const [homeSchedule, setHomeSchedule] = useState(EMPTY_HOME_SCHEDULE);
  const [homeScheduleLoading, setHomeScheduleLoading] = useState(false);
  const [homeScheduleError, setHomeScheduleError] = useState("");
  const [showStudentLogin, setShowStudentLogin] = useState(false);
  const [studentActionsUnlocked, setStudentActionsUnlocked] = useState(false);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [selectedStudentExpediente, setSelectedStudentExpediente] =
    useState("");
  const [studentViewerRefreshToken, setStudentViewerRefreshToken] = useState(0);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupViewerRefreshToken, setGroupViewerRefreshToken] = useState(0);
  const [showCreateHorarioModal, setShowCreateHorarioModal] = useState(false);
  const [horarioViewerRefreshToken, setHorarioViewerRefreshToken] = useState(0);

  useEffect(() => {
    if (!isHomePage) return;

    let cancelled = false;

    async function loadWeeklySchedule() {
      try {
        setHomeScheduleLoading(true);
        setHomeScheduleError("");

        const result = await listWeeklySchedule();
        if (!cancelled) {
          setHomeSchedule(result.schedule || EMPTY_HOME_SCHEDULE);
        }
      } catch (error) {
        if (!cancelled) {
          setHomeScheduleError(error.message || "No se pudo cargar el horario académico.");
          setHomeSchedule(EMPTY_HOME_SCHEDULE);
        }
      } finally {
        if (!cancelled) setHomeScheduleLoading(false);
      }
    }

    loadWeeklySchedule();

    return () => {
      cancelled = true;
    };
  }, [isHomePage]);

  const weekDayNames = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  const currentDay = weekDayNames[new Date().getDay()];
  const todaySchedule = homeSchedule[currentDay] || [];

  function handleStudentLoginSubmit(event) {
    event.preventDefault();
    setStudentActionsUnlocked(true);
    setShowStudentLogin(false);
  }

  async function handleDeleteStudent() {
    if (!selectedStudentExpediente) return;

    const confirmed = window.confirm(
      `Confirma que desea inactivar al estudiante ${selectedStudentExpediente}?`,
    );
    if (!confirmed) return;

    try {
      const result = await deleteStudentUseCase(selectedStudentExpediente);

      setStudentViewerRefreshToken((value) => value + 1);
      setSelectedStudentExpediente("");
      window.alert(result.message || "Estudiante inactivado correctamente.");
    } catch (error) {
      window.alert(error.message || "No se pudo eliminar el estudiante.");
    }
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
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Filtro
                </h3>
                <form
                  className="mt-4 grid gap-3"
                  aria-label="Filtros de solicitudes"
                >
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
                    <button
                      type="button"
                      className="rounded-lg border border-slate-300 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      Crear
                    </button>
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
                  <h2 className="text-lg font-semibold text-slate-800">
                    {title}
                  </h2>
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
                              ((action === "Actualizar" || action === "Eliminar") &&
                                !selectedStudentExpediente)
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
                                return;
                              }

                              if (
                                action === "Eliminar" &&
                                selectedStudentExpediente
                              ) {
                                handleDeleteStudent();
                              }
                            }}
                            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                              studentActionsUnlocked &&
                              !(
                                (action === "Actualizar" || action === "Eliminar") &&
                                !selectedStudentExpediente
                              )
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
                    {[
                      "Crear grupos",
                      "Crear horarios",
                      "Crear Laboratorio",
                    ].map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() =>
                          setActivePlanningAction((prev) =>
                            prev === action ? null : action,
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
                    {(isCoordinatorPage
                      ? ["Catedrático", "Facultad", "Plan de estudio"]
                      : ["Horario de Clases", "Grupos"]
                    ).map((action) => (
                      <button
                        key={action}
                        type="button"
                        onClick={
                          isHomePage
                            ? () => setActiveHomeAction(action)
                            : undefined
                        }
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                          isHomePage && activeHomeAction === action
                            ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-700"
                            : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </article>

              {!isHomePage && !isPlanningPage && !isCoordinatorPage ? (
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Filtro
                  </h3>

                  <form
                    className="mt-4 grid gap-3"
                    aria-label={`Filtros de ${title.toLowerCase()}`}
                  >
                    <label className="grid gap-1 text-sm">
                      <span className="font-medium text-slate-700">
                        Facultad
                      </span>
                      <select className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 outline-none focus:border-slate-500">
                        <option value="">Seleccione facultad</option>
                      </select>
                    </label>

                    {!isFacultiesPage ? (
                      <label className="grid gap-1 text-sm">
                        <span className="font-medium text-slate-700">
                          Materias
                        </span>
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
                  isHomePage || isPlanningPage || isCoordinatorPage
                    ? "lg:col-span-2"
                    : ""
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
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        {activePlanningAction ?? "Planeación"}
                      </h3>
                      {activePlanningAction === "Crear grupos" && (
                        <button
                          type="button"
                          onClick={() => setShowCreateGroupModal(true)}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          Nuevo grupo
                        </button>
                      )}
                      {activePlanningAction === "Crear horarios" && (
                        <button
                          type="button"
                          onClick={() => setShowCreateHorarioModal(true)}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                          Nuevo horario
                        </button>
                      )}
                    </div>
                    
                    {activePlanningAction === "Crear grupos" ? (
                      <GroupDataViewer refreshToken={groupViewerRefreshToken} />
                    ) : activePlanningAction === "Crear horarios" ? (
                      <HorarioDataViewer refreshToken={horarioViewerRefreshToken} />
                    ) : activePlanningAction === "Crear Laboratorio" ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                        Sección de "Crear Laboratorio" lista para integrarse.
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                        Seleccione una acción para continuar.
                      </div>
                    )}
                  </div>
                ) : isHomePage ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      {activeHomeAction}
                    </h3>

                    {activeHomeAction === "Horario de Clases" ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {HOME_DAYS.map((day) => (
                            <span
                              key={day}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                day === currentDay
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-300 bg-slate-50 text-slate-600"
                              }`}
                            >
                              {day}: {(homeSchedule[day] || []).length} clases
                            </span>
                          ))}
                        </div>

                        {homeScheduleLoading ? (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                            Cargando horario académico semanal...
                          </div>
                        ) : null}

                        {homeScheduleError ? (
                          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {homeScheduleError}
                          </div>
                        ) : null}

                        <div className="overflow-auto rounded-xl border border-slate-200">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 text-slate-700">
                              <tr>
                                <th className="px-3 py-2 text-left font-semibold">Dia</th>
                                <th className="px-3 py-2 text-left font-semibold">Hora</th>
                                <th className="px-3 py-2 text-left font-semibold">Grupo</th>
                                <th className="px-3 py-2 text-left font-semibold">Clase</th>
                                <th className="px-3 py-2 text-left font-semibold">Aula</th>
                              </tr>
                            </thead>
                            <tbody>
                              {todaySchedule.length > 0 ? (
                                todaySchedule.map((item) => (
                                  <tr key={`${currentDay}-${item.hora}-${item.grupo}`} className="border-t border-slate-200">
                                    <td className="px-3 py-2 text-slate-700">{currentDay}</td>
                                    <td className="px-3 py-2 text-slate-700">{item.hora}</td>
                                    <td className="px-3 py-2 font-semibold text-slate-700">{item.grupo}</td>
                                    <td className="px-3 py-2 text-slate-700">{item.clase}</td>
                                    <td className="px-3 py-2 text-slate-700">{item.aula}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr className="border-t border-slate-200">
                                  <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                                    No hay clases registradas para {currentDay}.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                          {todaySchedule.length > 0
                            ? `Clases del dia en transcurso: ${todaySchedule.map((item) => `${item.hora} (${item.grupo} - ${item.clase})`).join(", ")}.`
                            : `No hay clases programadas para ${currentDay}.`}
                        </div>
                      </>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                        Vista de grupos y distribución de clases lista para integración.
                      </div>
                    )}
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

      {isPlanningPage && showCreateGroupModal ? (
        <GroupCreateModal
          onClose={() => setShowCreateGroupModal(false)}
          onSuccess={() => setGroupViewerRefreshToken((value) => value + 1)}
        />
      ) : null}

      {isPlanningPage && showCreateHorarioModal ? (
        <HorarioCreateModal
          onClose={() => setShowCreateHorarioModal(false)}
          onSuccess={() => setHorarioViewerRefreshToken((value) => value + 1)}
        />
      ) : null}
    </main>
  );
}
