import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarPenalidades,
  obtenerPenalidad,
  modificarPenalidad,
} from "../../../application/penalidad/penalidadUseCases.js";

const ANIO_ACTUAL = new Date().getFullYear();

const FORMULARIO_INICIAL = {
  secretarioNombres: "",
  secretarioApellidos: "",
  decanoNombres: "",
  decanoApellidos: "",
  fecha: "",
  cantidadAniosEgreso: "",
  cicloReingreso: "",
  alumnoNombres: "",
  alumnoApellidos: "",
  carreraNombre: "",
  mesEgreso: "",
  anioEgreso: "",
  aniosEgresado: "",
};

function campoError(field, value) {
  const num = Number(value);
  if (field === "cantidadAniosEgreso") {
    if (value === "") return "";
    if (num < 2) return "Debe ser al menos 2 años.";
  }
  if (field === "anioEgreso") {
    if (value === "") return "";
    if (num > ANIO_ACTUAL) return `No puede ser mayor al año en curso (${ANIO_ACTUAL}).`;
  }
  if (field === "aniosEgresado") {
    if (value === "") return "";
    if (num < 2) return "Debe ser al menos 2 años.";
  }
  return "";
}

export function ModificarPenalidadPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [asignaturas, setAsignaturas] = useState([{ nombre: "", uv: "" }]);

  // Lista de penalidades para seleccionar
  const [lista, setLista] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [penalidadId, setPenalidadId] = useState(null);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    listarPenalidades({ limit: 100 })
      .then((res) => setLista(res.data ?? []))
      .catch(() => setLista([]))
      .finally(() => setCargandoLista(false));
  }, []);

  async function seleccionarPenalidad(id) {
    setCargandoFormulario(true);
    setMensajeError("");
    try {
      const pen = await obtenerPenalidad(id);
      setPenalidadId(id);

      // Separar nombre completo en partes (el backend guarda nombre completo combinado)
      const partsAlumno = (pen.alumno_nombre ?? "").split(" ");
      const mitadAlumno = Math.ceil(partsAlumno.length / 2);
      const partsSecretario = (pen.secretario_nombre ?? "").split(" ");
      const mitadSec = Math.ceil(partsSecretario.length / 2);
      const partsDecano = (pen.decano_nombre ?? "").split(" ");
      const mitadDec = Math.ceil(partsDecano.length / 2);

      setFormulario({
        secretarioNombres: partsSecretario.slice(0, mitadSec).join(" "),
        secretarioApellidos: partsSecretario.slice(mitadSec).join(" "),
        decanoNombres: partsDecano.slice(0, mitadDec).join(" "),
        decanoApellidos: partsDecano.slice(mitadDec).join(" "),
        fecha: pen.fecha ? pen.fecha.slice(0, 10) : "",
        cantidadAniosEgreso: String(pen.cantidad_anios_egreso ?? ""),
        cicloReingreso: pen.ciclo_reingreso ?? "",
        alumnoNombres: partsAlumno.slice(0, mitadAlumno).join(" "),
        alumnoApellidos: partsAlumno.slice(mitadAlumno).join(" "),
        carreraNombre: pen.carrera_nombre ?? "",
        mesEgreso: pen.mes_egreso ?? "",
        anioEgreso: String(pen.anio_egreso ?? ""),
        aniosEgresado: String(pen.anios_egresado ?? ""),
      });

      setAsignaturas(
        pen.asignaturas?.length > 0
          ? pen.asignaturas.map((a) => ({ nombre: a.asignatura_nombre, uv: a.uv != null ? String(a.uv) : "" }))
          : [{ nombre: "", uv: "" }]
      );
      setErrores({});
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      setMensajeError("No se pudo cargar la penalidad. " + (err.message ?? ""));
    } finally {
      setCargandoFormulario(false);
    }
  }

  function handleInputChange(field, value) {
    setFormulario((prev) => ({ ...prev, [field]: value }));
    const error = campoError(field, value);
    setErrores((prev) => ({ ...prev, [field]: error }));
  }

  function agregarAsignatura() {
    setAsignaturas((prev) => [...prev, { nombre: "", uv: "" }]);
  }

  function eliminarAsignatura(index) {
    setAsignaturas((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAsignaturaChange(index, field, value) {
    setAsignaturas((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/penalidad"), 1200);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nuevosErrores = {};
    ["cantidadAniosEgreso", "anioEgreso", "aniosEgresado"].forEach((field) => {
      nuevosErrores[field] = campoError(field, formulario[field]);
    });
    setErrores(nuevosErrores);
    const hayErrores = Object.values(nuevosErrores).some((err) => err !== "");
    if (hayErrores) return;

    setGuardando(true);
    setMensajeError("");
    try {
      const payload = {
        penalidad: {
          secretario_nombre: `${formulario.secretarioNombres} ${formulario.secretarioApellidos}`.trim(),
          decano_nombre: `${formulario.decanoNombres} ${formulario.decanoApellidos}`.trim(),
          fecha: formulario.fecha,
          cantidad_anios_egreso: Number(formulario.cantidadAniosEgreso),
          ciclo_reingreso: formulario.cicloReingreso,
          alumno_nombre: `${formulario.alumnoNombres} ${formulario.alumnoApellidos}`.trim(),
          carrera_nombre: formulario.carreraNombre,
          mes_egreso: formulario.mesEgreso,
          anio_egreso: Number(formulario.anioEgreso),
          anios_egresado: Number(formulario.aniosEgresado),
        },
        asignaturas: asignaturas
          .filter((a) => a.nombre.trim() !== "")
          .map((a) => ({
            asignatura_nombre: a.nombre.trim(),
            uv: a.uv !== "" ? Number(a.uv) : null,
          })),
      };
      await modificarPenalidad(penalidadId, payload);
      setMensajeExito("Penalidad actualizada correctamente.");
      // Refrescar lista
      const res = await listarPenalidades({ limit: 100 });
      setLista(res.data ?? []);
      setTimeout(() => {
        setMensajeExito("");
        setPenalidadId(null);
        setFormulario(FORMULARIO_INICIAL);
        setAsignaturas([{ nombre: "", uv: "" }]);
      }, 2000);
    } catch (err) {
      setMensajeError(err.message || "Error al actualizar la penalidad.");
    } finally {
      setGuardando(false);
    }
  }

  function inputClass(field) {
    return `rounded-lg border px-3 py-2 ${errores[field] ? "border-red-400 bg-red-50" : "border-slate-300"}`;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">
          Modificar penalidad
        </h2>

        {/* Lista de penalidades para seleccionar */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-x-auto">
          {cargandoLista ? (
            <p className="px-4 py-6 text-sm text-slate-500">Cargando registros...</p>
          ) : lista.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No hay penalidades registradas aún.</p>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Correlativo</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Alumno</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Fecha</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Estado</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-center text-xs font-semibold text-slate-600">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr
                    key={p.id}
                    className={`odd:bg-white even:bg-slate-50 ${penalidadId === p.id ? "ring-2 ring-inset ring-blue-400" : ""}`}
                  >
                    <td className="border-t border-slate-200 px-4 py-2">{p.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{p.alumno_nombre}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{p.fecha ? p.fecha.slice(0, 10) : ""}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{p.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => seleccionarPenalidad(p.id)}
                        disabled={cargandoFormulario}
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        {penalidadId === p.id ? "Seleccionado" : "Editar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mensaje cuando no se ha seleccionado ninguna */}
        {!penalidadId && !cargandoFormulario && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Selecciona una penalidad de la lista para editarla.</p>
          </div>
        )}

        {cargandoFormulario && (
          <p className="mt-4 text-sm text-slate-500">Cargando datos del formulario...</p>
        )}

        {/* Formulario de edición */}
        {penalidadId && !cargandoFormulario && (
          <form
          ref={formRef}
          className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
          aria-label="Formulario modificar penalidad"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Para (Secretario)</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Nombres</span>
                  <input
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Nombres del Secretario"
                    value={formulario.secretarioNombres}
                    onChange={(e) => handleInputChange("secretarioNombres", e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Apellidos</span>
                  <input
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Apellidos del Secretario"
                    value={formulario.secretarioApellidos}
                    onChange={(e) => handleInputChange("secretarioApellidos", e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
            <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">De (Decano)</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Nombres</span>
                  <input
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Nombres del Decano"
                    value={formulario.decanoNombres}
                    onChange={(e) => handleInputChange("decanoNombres", e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Apellidos</span>
                  <input
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Apellidos del Decano"
                    value={formulario.decanoApellidos}
                    onChange={(e) => handleInputChange("decanoApellidos", e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Fecha</span>
              <input
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2"
                value={formulario.fecha}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Cantidad de años de egreso</span>
              <input
                type="number"
                min="2"
                className={inputClass("cantidadAniosEgreso")}
                placeholder="Mín. 2"
                value={formulario.cantidadAniosEgreso}
                onChange={(e) => handleInputChange("cantidadAniosEgreso", e.target.value)}
                required
              />
              {errores.cantidadAniosEgreso && (
                <span className="text-xs text-red-600">{errores.cantidadAniosEgreso}</span>
              )}
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Ciclo de reingreso</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ej. I-2026"
                value={formulario.cicloReingreso}
                onChange={(e) => handleInputChange("cicloReingreso", e.target.value)}
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombres del alumno</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Nombres"
                value={formulario.alumnoNombres}
                onChange={(e) => handleInputChange("alumnoNombres", e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Apellidos del alumno</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Apellidos"
                value={formulario.alumnoApellidos}
                onChange={(e) => handleInputChange("alumnoApellidos", e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre de la carrera</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Nombre de la carrera"
                value={formulario.carreraNombre}
                onChange={(e) => handleInputChange("carreraNombre", e.target.value)}
                required
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Mes de egreso</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ej. Noviembre"
                value={formulario.mesEgreso}
                onChange={(e) => handleInputChange("mesEgreso", e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Año de egreso</span>
              <input
                type="number"
                min="1900"
                max={ANIO_ACTUAL}
                className={inputClass("anioEgreso")}
                placeholder={`Máx. ${ANIO_ACTUAL}`}
                value={formulario.anioEgreso}
                onChange={(e) => handleInputChange("anioEgreso", e.target.value)}
                required
              />
              {errores.anioEgreso && (
                <span className="text-xs text-red-600">{errores.anioEgreso}</span>
              )}
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Años de egresado</span>
              <input
                type="number"
                min="2"
                className={inputClass("aniosEgresado")}
                placeholder="Mín. 2"
                value={formulario.aniosEgresado}
                onChange={(e) => handleInputChange("aniosEgresado", e.target.value)}
                required
              />
              {errores.aniosEgresado && (
                <span className="text-xs text-red-600">{errores.aniosEgresado}</span>
              )}
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                Asignaturas a cursar
              </h3>
              <button
                type="button"
                onClick={agregarAsignatura}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>add</span>
                Agregar
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {asignaturas.map((asignatura, index) => (
                <div key={index} className="grid grid-cols-[1fr_100px_auto] gap-2 items-center">
                  <input
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder={`Asignatura ${index + 1}`}
                    value={asignatura.nombre}
                    onChange={(e) => handleAsignaturaChange(index, "nombre", e.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="UV"
                    value={asignatura.uv}
                    onChange={(e) => handleAsignaturaChange(index, "uv", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => eliminarAsignatura(index)}
                    disabled={asignaturas.length === 1}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                    aria-label="Eliminar asignatura"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>delete</span>
                  </button>
                </div>
              ))}
            </div>
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
              disabled={guardando}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Actualizar penalidad"}
            </button>
          </div>
        </form>
        )}
      </section>

      {showCancelNotice ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-800">Se ha cancelado esta acción</p>
          <p className="mt-1 text-xs text-amber-700">Redirigiendo a Penalidad...</p>
        </div>
      ) : null}

      {mensajeExito && (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-green-800">{mensajeExito}</p>
        </div>
      )}

      {mensajeError && (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-red-800">Error</p>
          <p className="mt-1 text-xs text-red-700">{mensajeError}</p>
        </div>
      )}
    </main>
  );
}
