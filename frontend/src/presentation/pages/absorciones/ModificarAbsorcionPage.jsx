import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { listarAbsorciones, obtenerAbsorcion, modificarAbsorcion } from "../../../application/absorciones/absorcionesUseCases.js";
import { AcademicCycleFields } from "../../components/shared/AcademicCycleFields.jsx";
import { normalizeByField, toUppercaseText } from "../../utils/formNormalizers.js";

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
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoLista, setCargandoLista] = useState(true);
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

  useEffect(() => {
    listarAbsorciones({ limit: 100 })
      .then((res) => setLista(res.data ?? []))
      .catch(() => setLista([]))
      .finally(() => setCargandoLista(false));
  }, []);

  const listaFiltrada = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return lista;

    return lista.filter((absorcion) => {
      const texto = [
        absorcion.correlativo,
        absorcion.alumno_nombre,
        absorcion.carrera_origen,
        absorcion.plan_solicitado,
        absorcion.fecha ? String(absorcion.fecha).slice(0, 10) : "",
        absorcion.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termino);
    });
  }, [busqueda, lista]);

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
    const nextValue = normalizeByField(field, value, { preserve: ["fecha"] });
    setFormulario((prev) => ({ ...prev, [field]: nextValue }));
  }

  function handleAbsorcionChange(index, field, value) {
    setTablaAbsorcion((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "notaAsignada" ? value : toUppercaseText(value),
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
              [field]: field === "nota" ? value : toUppercaseText(value),
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
              [field]: field === "nota" ? value : toUppercaseText(value),
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
        estado: "CREADO",
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
            <h2 className="text-base font-semibold text-slate-700">Historial absorción</h2>
            <p className="mt-1 text-sm text-slate-500">
              Busque un dictamen existente, seleccione el registro y edite los datos necesarios.
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

        <div className="mt-4">
          <label className="grid gap-1 text-sm sm:max-w-md">
            <span className="font-medium text-slate-700">Buscar reportes creados</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "1.15rem" }}>search</span>
              <input
                type="search"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Buscar por correlativo, alumno, carrera, plan, fecha o estado"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
              {busqueda ? (
                <button type="button" onClick={() => setBusqueda("")} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Limpiar busqueda">
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
                </button>
              ) : null}
            </div>
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-x-auto">
          {cargandoLista ? (
            <p className="px-4 py-6 text-sm text-slate-500">Cargando registros...</p>
          ) : lista.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No hay absorciones registradas aún.</p>
          ) : listaFiltrada.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No se encontraron absorciones con esa búsqueda.</p>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Correlativo</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Alumno</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Carrera origen</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Plan solicitado</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Fecha</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Estado</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-center text-xs font-semibold text-slate-600">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((absorcion) => (
                  <tr key={absorcion.id} className={`odd:bg-white even:bg-slate-50 ${loadedId === absorcion.id ? "ring-2 ring-inset ring-blue-400" : ""}`}>
                    <td className="border-t border-slate-200 px-4 py-2">{absorcion.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{absorcion.alumno_nombre}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{absorcion.carrera_origen}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{absorcion.plan_solicitado}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{absorcion.fecha ? String(absorcion.fecha).slice(0, 10) : ""}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{absorcion.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => loadAbsorcion(absorcion.id)}
                        disabled={isLoading}
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        {loadedId === absorcion.id ? "Seleccionado" : "Editar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loadedId && !isLoading ? (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Selecciona una absorción de la lista para editarla.</p>
          </div>
        ) : null}

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
        ) : loadedId ? (
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
              <AcademicCycleFields
                value={formulario.ciclo}
                onChange={(value) => handleInputChange("ciclo", value)}
                required
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-1"
              />
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
                {isSubmitting ? "Guardando..." : "Historial absorción"}
              </button>
            </div>
          </form>
        ) : null}
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
