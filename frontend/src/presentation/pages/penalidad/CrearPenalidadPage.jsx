import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPenalidad } from "../../../application/penalidad/penalidadUseCases.js";

const ANIO_ACTUAL = new Date().getFullYear();

const INICIAL = {
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

export function CrearPenalidadPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [form, setForm] = useState(INICIAL);
  const [errores, setErrores] = useState({});
  const [asignaturas, setAsignaturas] = useState([{ nombre: "", uv: "" }]);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = {};
    ["cantidadAniosEgreso", "anioEgreso", "aniosEgresado"].forEach((field) => {
      nuevosErrores[field] = campoError(field, form[field]);
    });
    setErrores(nuevosErrores);
    const hayErrores = Object.values(nuevosErrores).some((err) => err !== "");
    if (hayErrores) return;

    setGuardando(true);
    setMensajeError("");
    try {
      const payload = {
        penalidad: {
          secretario_nombre: `${form.secretarioNombres} ${form.secretarioApellidos}`.trim(),
          decano_nombre: `${form.decanoNombres} ${form.decanoApellidos}`.trim(),
          fecha: form.fecha,
          cantidad_anios_egreso: Number(form.cantidadAniosEgreso),
          ciclo_reingreso: form.cicloReingreso,
          alumno_nombre: `${form.alumnoNombres} ${form.alumnoApellidos}`.trim(),
          carrera_nombre: form.carreraNombre,
          mes_egreso: form.mesEgreso,
          anio_egreso: Number(form.anioEgreso),
          anios_egresado: Number(form.aniosEgresado),
          estado: "BORRADOR",
        },
        asignaturas: asignaturas
          .filter((a) => a.nombre.trim() !== "")
          .map((a) => ({
            asignatura_nombre: a.nombre.trim(),
            uv: a.uv !== "" ? Number(a.uv) : null,
          })),
      };
      await crearPenalidad(payload);
      setMensajeExito("Penalidad creada correctamente.");
      setForm(INICIAL);
      setAsignaturas([{ nombre: "", uv: "" }]);
      setErrores({});
      setTimeout(() => navigate("/penalidad/imprimir"), 1500);
    } catch (err) {
      setMensajeError(err.message || "Error al guardar la penalidad.");
    } finally {
      setGuardando(false);
    }
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/penalidad"), 1200);
  }

  function inputClass(field) {
    return `rounded-lg border px-3 py-2 ${errores[field] ? "border-red-400 bg-red-50" : "border-slate-300"}`;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">
          Crear penalidad
        </h2>

        <form
          className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
          aria-label="Formulario crear penalidad"
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
                    value={form.secretarioNombres}
                    onChange={(e) => handleChange("secretarioNombres", e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Apellidos</span>
                  <input
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Apellidos del Secretario"
                    value={form.secretarioApellidos}
                    onChange={(e) => handleChange("secretarioApellidos", e.target.value)}
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
                    value={form.decanoNombres}
                    onChange={(e) => handleChange("decanoNombres", e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium text-slate-700">Apellidos</span>
                  <input
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Apellidos del Decano"
                    value={form.decanoApellidos}
                    onChange={(e) => handleChange("decanoApellidos", e.target.value)}
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
                value={form.fecha}
                onChange={(e) => handleChange("fecha", e.target.value)}
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
                value={form.cantidadAniosEgreso}
                onChange={(e) => handleChange("cantidadAniosEgreso", e.target.value)}
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
                value={form.cicloReingreso}
                onChange={(e) => handleChange("cicloReingreso", e.target.value)}
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
                value={form.alumnoNombres}
                onChange={(e) => handleChange("alumnoNombres", e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Apellidos del alumno</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Apellidos"
                value={form.alumnoApellidos}
                onChange={(e) => handleChange("alumnoApellidos", e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre de la carrera</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Nombre de la carrera"
                value={form.carreraNombre}
                onChange={(e) => handleChange("carreraNombre", e.target.value)}
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
                value={form.mesEgreso}
                onChange={(e) => handleChange("mesEgreso", e.target.value)}
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
                value={form.anioEgreso}
                onChange={(e) => handleChange("anioEgreso", e.target.value)}
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
                value={form.aniosEgresado}
                onChange={(e) => handleChange("aniosEgresado", e.target.value)}
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
              {guardando ? "Guardando..." : "Guardar penalidad"}
            </button>
          </div>
        </form>
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
          <p className="mt-1 text-xs text-green-700">Redirigiendo a Imprimir penalidad...</p>
        </div>
      )}

      {mensajeError && (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-red-800">Error al guardar</p>
          <p className="mt-1 text-xs text-red-700">{mensajeError}</p>
        </div>
      )}
    </main>
  );
}
