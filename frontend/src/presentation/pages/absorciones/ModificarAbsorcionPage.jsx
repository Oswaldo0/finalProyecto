import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { obtenerAbsorcion, modificarAbsorcion } from "../../../application/absorciones/absorcionesUseCases.js";

const TABLA_ABSORCION_INICIAL = [
  {
    asignaturaCursada: "",
    asignaturaAbsorbida: "",
    notaAsignada: "",
  },
];

const TABLA_NO_EXISTE_INICIAL = [
  {
    asignatura: "",
    nota: "",
  },
];

const TABLA_REPROBADAS_INICIAL = [
  {
    asignatura: "",
    nota: "",
  },
];

const FORMULARIO_INICIAL = {
  facultad: "",
  ciclo: "",
  fecha: "",
  nombreAlumno: "",
  apellidosAlumno: "",
  carreraOrigen: "",
  planOrigen: "",
  planSolicitado: "",
  encabezadoDictamen:
    "El Decano de la Facultad informa que el bachiller ha solicitado absorcion al plan solicitado y, de acuerdo al Reglamento de Administracion Academica y Reglamento de Equivalencias, se dictamina absorber las asignaturas detalladas.",
  decanoNombre: "",
  facultadFirma: "",
};

export function ModificarAbsorcionPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const initialId = routeId ?? queryId ?? "";

  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [tablaAbsorcion, setTablaAbsorcion] = useState(TABLA_ABSORCION_INICIAL);
  const [tablaNoExiste, setTablaNoExiste] = useState(TABLA_NO_EXISTE_INICIAL);
  const [tablaReprobadas, setTablaReprobadas] = useState(TABLA_REPROBADAS_INICIAL);
  const [lookupId, setLookupId] = useState(initialId);
  const [loadedId, setLoadedId] = useState(initialId ? Number(initialId) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (routeId || queryId) {
      loadAbsorcion(routeId ?? queryId);
    }
  }, [routeId, queryId]);

  function normalizeAbsorbidas(items) {
    return items.length > 0
      ? items.map((item) => ({
          asignaturaCursada: item.asignatura_cursada ?? "",
          asignaturaAbsorbida: item.asignatura_absorbida ?? "",
          notaAsignada: item.nota_asignada ?? "",
        }))
      : TABLA_ABSORCION_INICIAL;
  }

  function normalizeAsignaturas(items) {
    return items.length > 0
      ? items.map((item) => ({
          asignatura: item.asignatura_nombre ?? "",
          nota: item.nota ?? "",
        }))
      : TABLA_NO_EXISTE_INICIAL;
  }

  async function loadAbsorcion(id) {
    if (!id) return;
    setErrorMessage("");
    setInfoMessage("");
    setIsLoading(true);

    try {
      const absorcion = await obtenerAbsorcion(id);
      setFormulario({
        facultad: absorcion.facultad_nombre ?? "",
        ciclo: absorcion.ciclo ?? "",
        fecha: absorcion.fecha ?? "",
        nombreAlumno: absorcion.alumno_nombres ?? "",
        apellidosAlumno: absorcion.alumno_apellidos ?? "",
        carreraOrigen: absorcion.carrera_origen ?? "",
        planOrigen: absorcion.plan_origen ?? "",
        planSolicitado: absorcion.plan_solicitado ?? "",
        encabezadoDictamen: absorcion.encabezado_dictamen ?? FORMULARIO_INICIAL.encabezadoDictamen,
        decanoNombre: absorcion.decano_nombre ?? "",
        facultadFirma: absorcion.facultad_firma_nombre ?? "",
      });
      setTablaAbsorcion(normalizeAbsorbidas(absorcion.absorbidas ?? []));
      setTablaNoExiste(normalizeAsignaturas(absorcion.noExistentes ?? []));
      setTablaReprobadas(normalizeAsignaturas(absorcion.reprobadas ?? []));
      setLoadedId(Number(id));
      setLookupId(String(id));
      setInfoMessage(`Cargando absorcion #${id}.`);
    } catch (err) {
      setErrorMessage(err.message || "No se pudo cargar la absorcion.");
      setLoadedId(null);
      setTablaAbsorcion(TABLA_ABSORCION_INICIAL);
      setTablaNoExiste(TABLA_NO_EXISTE_INICIAL);
      setTablaReprobadas(TABLA_REPROBADAS_INICIAL);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(field, value) {
    const upperFields = [
      "facultad",
      "ciclo",
      "nombreAlumno",
      "apellidosAlumno",
      "carreraOrigen",
      "planOrigen",
      "planSolicitado",
      "decanoNombre",
      "facultadFirma",
    ];

    const nextValue = upperFields.includes(field) ? String(value).toUpperCase() : value;
    setFormulario((prev) => ({ ...prev, [field]: nextValue }));
  }

  function handleAbsorcionChange(index, field, value) {
    setTablaAbsorcion((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "notaAsignada" ? value : String(value).toUpperCase(),
            }
          : item,
      ),
    );
  }

  function handleNoExisteChange(index, field, value) {
    setTablaNoExiste((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "nota" ? value : String(value).toUpperCase(),
            }
          : item,
      ),
    );
  }

  function handleReprobadasChange(index, field, value) {
    setTablaReprobadas((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "nota" ? value : String(value).toUpperCase(),
            }
          : item,
      ),
    );
  }

  function agregarAbsorcionFila() {
    setTablaAbsorcion((prev) => [
      ...prev,
      { asignaturaCursada: "", asignaturaAbsorbida: "", notaAsignada: "" },
    ]);
  }

  function eliminarAbsorcionFila(index) {
    setTablaAbsorcion((prev) => prev.filter((_, i) => i !== index));
  }

  function agregarNoExisteFila() {
    setTablaNoExiste((prev) => [...prev, { asignatura: "", nota: "" }]);
  }

  function eliminarNoExisteFila(index) {
    setTablaNoExiste((prev) => prev.filter((_, i) => i !== index));
  }

  function agregarReprobadasFila() {
    setTablaReprobadas((prev) => [...prev, { asignatura: "", nota: "" }]);
  }

  function eliminarReprobadasFila(index) {
    setTablaReprobadas((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/absorciones");
    }, 1200);
  }

  function sanitizeNumber(value) {
    const normalized = String(value).trim().replace(",", ".");
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  function normalizeAbsorbidasForSave(items) {
    return items
      .map((row) => ({
        asignatura_cursada: row.asignaturaCursada.trim(),
        asignatura_absorbida: row.asignaturaAbsorbida.trim(),
        nota_asignada: sanitizeNumber(row.notaAsignada),
      }))
      .filter((row) => row.asignatura_cursada || row.asignatura_absorbida);
  }

  function normalizeAsignaturasForSave(items) {
    return items
      .map((row) => ({
        asignatura_nombre: row.asignatura.trim(),
        nota: sanitizeNumber(row.nota),
      }))
      .filter((row) => row.asignatura_nombre);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!loadedId) {
      setErrorMessage("Debe cargar primero una absorcion valida para modificar.");
      return;
    }

    const requiredFields = [
      formulario.facultad,
      formulario.ciclo,
      formulario.fecha,
      formulario.nombreAlumno,
      formulario.apellidosAlumno,
      formulario.carreraOrigen,
      formulario.planOrigen,
      formulario.planSolicitado,
      formulario.decanoNombre,
      formulario.facultadFirma,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      setErrorMessage("Debe completar todos los campos requeridos antes de guardar.");
      return;
    }

    const payload = {
      absorcion: {
        facultad_nombre: formulario.facultad.trim(),
        ciclo: formulario.ciclo.trim(),
        fecha: formulario.fecha,
        alumno_nombres: formulario.nombreAlumno.trim(),
        alumno_apellidos: formulario.apellidosAlumno.trim(),
        carrera_origen: formulario.carreraOrigen.trim(),
        plan_origen: formulario.planOrigen.trim(),
        plan_solicitado: formulario.planSolicitado.trim(),
        encabezado_dictamen: formulario.encabezadoDictamen.trim(),
        decano_nombre: formulario.decanoNombre.trim(),
        facultad_firma_nombre: formulario.facultadFirma.trim(),
        estado: "BORRADOR",
      },
      absorbidas: normalizeAbsorbidasForSave(tablaAbsorcion),
      noExistentes: normalizeAsignaturasForSave(tablaNoExiste),
      reprobadas: normalizeAsignaturasForSave(tablaReprobadas),
    };

    setIsSubmitting(true);
    try {
      await modificarAbsorcion(loadedId, payload);
      navigate("/absorciones");
    } catch (err) {
      setErrorMessage(err.message || "Error al actualizar la absorcion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLookupSubmit(event) {
    event.preventDefault();
    if (!lookupId.trim()) {
      setErrorMessage("Debe ingresar un id de absorcion.");
      return;
    }
    navigate(`/absorciones/modificar/${lookupId.trim()}`);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-700">Modificar absorcion</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cargue un dictamen existente para editarlo. Puede usar la ruta <code>/absorciones/modificar/&lt;id&gt;</code> o introducir el id aqui.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/absorciones")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Volver
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">{loadedId ? `Editando absorcion #${loadedId}` : "Cargar absorcion existente"}</p>
          <p className="mt-1 text-xs text-blue-700">
            {loadedId
              ? "Ajuste los campos y guarde para actualizar el documento."
              : "Ingrese un id valido para cargar los datos del dictamen."}
          </p>
        </div>

        <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" onSubmit={handleLookupSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Id de absorcion</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ej. 1"
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex h-[44px] items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Cargar absorcion
              </button>
            </div>
          </div>
        </form>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {infoMessage ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {infoMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">Cargando absorcion...</div>
        ) : (
          <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario modificar absorcion" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Facultad</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Ej. Ingenieria"
                  value={formulario.facultad}
                  onChange={(event) => handleInputChange("facultad", event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Ciclo</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Ej. I-2026"
                  value={formulario.ciclo}
                  onChange={(event) => handleInputChange("ciclo", event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Fecha</span>
                <input
                  type="date"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={formulario.fecha}
                  onChange={(event) => handleInputChange("fecha", event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Nombre del alumno</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Nombre completo"
                  value={formulario.nombreAlumno}
                  onChange={(event) => handleInputChange("nombreAlumno", event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Apellidos del alumno</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Apellidos"
                  value={formulario.apellidosAlumno}
                  onChange={(event) => handleInputChange("apellidosAlumno", event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Carrera de origen</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Carrera de origen"
                  value={formulario.carreraOrigen}
                  onChange={(event) => handleInputChange("carreraOrigen", event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Plan de origen</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Plan de origen"
                  value={formulario.planOrigen}
                  onChange={(event) => handleInputChange("planOrigen", event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Plan solicitado</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Plan solicitado"
                  value={formulario.planSolicitado}
                  onChange={(event) => handleInputChange("planSolicitado", event.target.value)}
                  required
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Encabezado del dictamen</span>
              <textarea
                className="min-h-[90px] rounded-lg border border-slate-300 px-3 py-2"
                value={formulario.encabezadoDictamen}
                onChange={(event) => handleInputChange("encabezadoDictamen", event.target.value)}
              />
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas absorbidas</h3>
                <button
                  type="button"
                  onClick={agregarAbsorcionFila}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Agregar fila
                </button>
              </div>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura cursada</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura absorbida</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Nota asignada</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-700">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaAbsorcion.map((item, index) => (
                      <tr key={`abs-${index}`} className="odd:bg-white even:bg-slate-50">
                        <td className="border-t border-slate-200 px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-2 py-1"
                            value={item.asignaturaCursada}
                            onChange={(event) => handleAbsorcionChange(index, "asignaturaCursada", event.target.value)}
                            placeholder="Asignatura"
                          />
                        </td>
                        <td className="border-t border-slate-200 px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-2 py-1"
                            value={item.asignaturaAbsorbida}
                            onChange={(event) => handleAbsorcionChange(index, "asignaturaAbsorbida", event.target.value)}
                            placeholder="Asignatura"
                          />
                        </td>
                        <td className="border-t border-slate-200 px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-2 py-1"
                            value={item.notaAsignada}
                            onChange={(event) => handleAbsorcionChange(index, "notaAsignada", event.target.value)}
                            placeholder="Nota"
                          />
                        </td>
                        <td className="border-t border-slate-200 px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarAbsorcionFila(index)}
                            disabled={tablaAbsorcion.length === 1}
                            className="rounded-lg border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Pierde por no existir en plan solicitado</h3>
                <button
                  type="button"
                  onClick={agregarNoExisteFila}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Agregar fila
                </button>
              </div>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Nota</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-700">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaNoExiste.map((item, index) => (
                      <tr key={`no-existe-${index}`} className="odd:bg-white even:bg-slate-50">
                        <td className="border-t border-slate-200 px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-2 py-1"
                            value={item.asignatura}
                            onChange={(event) => handleNoExisteChange(index, "asignatura", event.target.value)}
                            placeholder="Asignatura"
                          />
                        </td>
                        <td className="border-t border-slate-200 px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-2 py-1"
                            value={item.nota}
                            onChange={(event) => handleNoExisteChange(index, "nota", event.target.value)}
                            placeholder="Nota"
                          />
                        </td>
                        <td className="border-t border-slate-200 px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarNoExisteFila(index)}
                            disabled={tablaNoExiste.length === 1}
                            className="rounded-lg border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas cursadas, reprobadas y absorbidas</h3>
                <button
                  type="button"
                  onClick={agregarReprobadasFila}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Agregar fila
                </button>
              </div>
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Nota</th>
                      <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold text-slate-700">Accion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaReprobadas.map((item, index) => (
                      <tr key={`rep-${index}`} className="odd:bg-white even:bg-slate-50">
                        <td className="border-t border-slate-200 px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-2 py-1"
                            value={item.asignatura}
                            onChange={(event) => handleReprobadasChange(index, "asignatura", event.target.value)}
                            placeholder="Asignatura"
                          />
                        </td>
                        <td className="border-t border-slate-200 px-2 py-1.5">
                          <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 px-2 py-1"
                            value={item.nota}
                            onChange={(event) => handleReprobadasChange(index, "nota", event.target.value)}
                            placeholder="Nota"
                          />
                        </td>
                        <td className="border-t border-slate-200 px-2 py-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarReprobadasFila(index)}
                            disabled={tablaReprobadas.length === 1}
                            className="rounded-lg border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Nombre del decano</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Nombre del decano"
                  value={formulario.decanoNombre}
                  onChange={(event) => handleInputChange("decanoNombre", event.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Facultad que firma</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="Facultad"
                  value={formulario.facultadFirma}
                  onChange={(event) => handleInputChange("facultadFirma", event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelAction}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Actualizar absorcion"}
              </button>
            </div>
          </form>
        )}
      </section>

      {showCancelNotice ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-800">Se ha cancelado esta accion</p>
          <p className="mt-1 text-xs text-amber-700">Redirigiendo a Absorciones...</p>
        </div>
      ) : null}
    </main>
  );
}
