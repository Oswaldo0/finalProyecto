import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarRetirosCiclo,
  obtenerRetiroCiclo,
  modificarRetiro,
} from "../../../application/retiroCiclo/retiroCicloUseCases.js";

const FORMULARIO_INICIAL = {
  expediente: "",
  carnet: "",
  fecha: "",
  alumnoNombres: "",
  alumnoApellidos: "",
  carrera: "",
  cicloRetirar: "",
  articuloReferencia: "Artículo 14",
  textoResolucion:
    "De acuerdo a su solicitud y en base al artículo 14 del Reglamento de Administración Académica, se autoriza al bachiller, previo al pago del arancel correspondiente, el retiro extraordinario de las asignaturas inscritas en el ciclo indicado.",
  observacionFinal: "",
  decanoNombres: "",
  decanoApellidos: "",
  facultad: "",
};

const CAMPOS_MAYUSCULAS = new Set([
  "alumnoNombres",
  "alumnoApellidos",
  "carrera",
  "decanoNombres",
  "decanoApellidos",
  "facultad",
]);

export function ModificarRetiroCicloPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [materias, setMaterias] = useState([{ nombre: "", uv: "" }]);

  const [lista, setLista] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [retiroId, setRetiroId] = useState(null);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    listarRetirosCiclo({ limit: 100 })
      .then((res) => setLista(res.data ?? []))
      .catch(() => setLista([]))
      .finally(() => setCargandoLista(false));
  }, []);

  async function seleccionarRetiro(id) {
    setCargandoFormulario(true);
    setMensajeError("");
    setMensajeExito("");
    try {
      const ret = await obtenerRetiroCiclo(id);
      setRetiroId(id);

      const partsAlumno = (ret.alumno_nombre ?? "").split(" ");
      const mitadAlumno = Math.ceil(partsAlumno.length / 2);
      const partsDecano = (ret.decano_nombre ?? "").split(" ");
      const mitadDecano = Math.ceil(partsDecano.length / 2);

      setFormulario({
        expediente: ret.expediente ?? "",
        carnet: ret.carnet ?? "",
        fecha: ret.fecha ? ret.fecha.slice(0, 10) : "",
        alumnoNombres: partsAlumno.slice(0, mitadAlumno).join(" "),
        alumnoApellidos: partsAlumno.slice(mitadAlumno).join(" "),
        carrera: ret.carrera_nombre ?? "",
        cicloRetirar: ret.ciclo_a_retirar ?? "",
        articuloReferencia: ret.articulo_referencia ?? "Artículo 14",
        textoResolucion: ret.texto_resolucion ?? "",
        observacionFinal: ret.observacion_final ?? "",
        decanoNombres: partsDecano.slice(0, mitadDecano).join(" "),
        decanoApellidos: partsDecano.slice(mitadDecano).join(" "),
        facultad: ret.facultad_nombre ?? "",
      });

      setMaterias(
        ret.asignaturas?.length > 0
          ? ret.asignaturas.map((a) => ({
              nombre: a.asignatura_nombre,
              uv: a.uv != null ? String(a.uv) : "",
            }))
          : [{ nombre: "", uv: "" }],
      );

      setTimeout(
        () =>
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        50,
      );
    } catch (err) {
      setMensajeError("No se pudo cargar el retiro. " + (err.message ?? ""));
    } finally {
      setCargandoFormulario(false);
    }
  }

  function handleInputChange(field, value) {
    const finalValue = CAMPOS_MAYUSCULAS.has(field)
      ? value.toUpperCase()
      : value;
    setFormulario((prev) => ({ ...prev, [field]: finalValue }));
  }

  function handleMateriaChange(index, field, value) {
    setMaterias((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function agregarMateria() {
    setMaterias((prev) => [...prev, { nombre: "", uv: "" }]);
  }

  function eliminarMateria(index) {
    setMaterias((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/retiro-ciclo"), 1200);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!retiroId) return;
    setGuardando(true);
    setMensajeError("");
    setMensajeExito("");
    try {
      const payload = {
        retiro: {
          expediente: formulario.expediente,
          carnet: formulario.carnet,
          fecha: formulario.fecha,
          alumno_nombre:
            `${formulario.alumnoNombres} ${formulario.alumnoApellidos}`.trim(),
          carrera_nombre: formulario.carrera,
          ciclo_a_retirar: formulario.cicloRetirar,
          articulo_referencia: formulario.articuloReferencia,
          texto_resolucion: formulario.textoResolucion,
          observacion_final: formulario.observacionFinal,
          decano_nombre:
            `${formulario.decanoNombres} ${formulario.decanoApellidos}`.trim(),
          facultad_nombre: formulario.facultad,
        },
        asignaturas: materias
          .filter((m) => m.nombre.trim() !== "")
          .map((m) => ({
            asignatura_nombre: m.nombre.trim(),
            uv: m.uv !== "" ? Number(m.uv) : null,
          })),
      };
      await modificarRetiro(retiroId, payload);
      setMensajeExito("Retiro de ciclo actualizado correctamente.");
      // Refrescar lista
      listarRetirosCiclo({ limit: 100 })
        .then((res) => setLista(res.data ?? []))
        .catch(() => {});
    } catch (err) {
      setMensajeError(
        "Error al actualizar: " + (err.message ?? "Error desconocido."),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      {/* Tabla de selección */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">
          Modificar retiro de ciclo
        </h2>

        {cargandoLista ? (
          <p className="mt-4 text-sm text-slate-500">Cargando registros...</p>
        ) : lista.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Sin registros</p>
            <p className="mt-1 text-xs text-blue-700">
              No hay retiros de ciclo creados. Ve a &quot;Crear retiro de
              ciclo&quot; para añadir registros.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-2 text-left">Correlativo</th>
                  <th className="px-4 py-2 text-left">Alumno</th>
                  <th className="px-4 py-2 text-left">Carrera</th>
                  <th className="px-4 py-2 text-left">Ciclo</th>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-t border-slate-100 ${retiroId === r.id ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-slate-600">
                      {r.correlativo}
                    </td>
                    <td className="px-4 py-2">{r.alumno_nombre}</td>
                    <td className="px-4 py-2">{r.carrera_nombre}</td>
                    <td className="px-4 py-2">{r.ciclo_a_retirar}</td>
                    <td className="px-4 py-2">
                      {r.fecha ? r.fecha.slice(0, 10) : ""}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          r.estado === "EMITIDO"
                            ? "bg-green-100 text-green-800"
                            : r.estado === "ANULADO"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => seleccionarRetiro(r.id)}
                        disabled={cargandoFormulario}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Formulario de edición */}
      {retiroId && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-700">
            Editando retiro #{retiroId}
          </h3>
          {mensajeExito && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2">
              <p className="text-sm font-semibold text-green-800">
                {mensajeExito}
              </p>
            </div>
          )}
          {mensajeError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2">
              <p className="text-sm font-semibold text-red-800">
                {mensajeError}
              </p>
            </div>
          )}

          <form
            ref={formRef}
            className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
            aria-label="Formulario modificar retiro de ciclo"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Expediente</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={formulario.expediente}
                  onChange={(e) =>
                    handleInputChange("expediente", e.target.value)
                  }
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Carnet</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={formulario.carnet}
                  onChange={(e) => handleInputChange("carnet", e.target.value)}
                  required
                />
              </label>
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
            </div>

            {/* Alumno */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Alumno
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">Nombres</span>
                    <input
                      type="text"
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="NOMBRES"
                      value={formulario.alumnoNombres}
                      onChange={(e) =>
                        handleInputChange("alumnoNombres", e.target.value)
                      }
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      Apellidos
                    </span>
                    <input
                      type="text"
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="APELLIDOS"
                      value={formulario.alumnoApellidos}
                      onChange={(e) =>
                        handleInputChange("alumnoApellidos", e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
              </div>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Carrera</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="NOMBRE DE LA CARRERA"
                  value={formulario.carrera}
                  onChange={(e) => handleInputChange("carrera", e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">
                  Ciclo a retirar
                </span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={formulario.cicloRetirar}
                  onChange={(e) =>
                    handleInputChange("cicloRetirar", e.target.value)
                  }
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">
                  Artículo de referencia
                </span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={formulario.articuloReferencia}
                  onChange={(e) =>
                    handleInputChange("articuloReferencia", e.target.value)
                  }
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">
                Texto de resolución
              </span>
              <textarea
                className="min-h-[100px] rounded-lg border border-slate-300 px-3 py-2"
                value={formulario.textoResolucion}
                onChange={(e) =>
                  handleInputChange("textoResolucion", e.target.value)
                }
              />
            </label>

            {/* Asignaturas */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Asignaturas inscritas
                </h3>
                <button
                  type="button"
                  onClick={agregarMateria}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.1rem" }}
                  >
                    add
                  </span>
                  Agregar
                </button>
              </div>
              <div className="mt-3 grid gap-2">
                {materias.map((materia, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_100px_auto] gap-2 items-center"
                  >
                    <input
                      type="text"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder={`Asignatura ${index + 1}`}
                      value={materia.nombre}
                      onChange={(e) =>
                        handleMateriaChange(index, "nombre", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="UV"
                      value={materia.uv}
                      onChange={(e) =>
                        handleMateriaChange(index, "uv", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => eliminarMateria(index)}
                      disabled={materias.length === 1}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                      aria-label="Eliminar asignatura"
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1.2rem" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">
                Observación final
              </span>
              <textarea
                className="min-h-[80px] rounded-lg border border-slate-300 px-3 py-2"
                value={formulario.observacionFinal}
                onChange={(e) =>
                  handleInputChange("observacionFinal", e.target.value)
                }
              />
            </label>

            {/* Decano */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Decano
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">Nombres</span>
                    <input
                      type="text"
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="NOMBRES"
                      value={formulario.decanoNombres}
                      onChange={(e) =>
                        handleInputChange("decanoNombres", e.target.value)
                      }
                      required
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium text-slate-700">
                      Apellidos
                    </span>
                    <input
                      type="text"
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      placeholder="APELLIDOS"
                      value={formulario.decanoApellidos}
                      onChange={(e) =>
                        handleInputChange("decanoApellidos", e.target.value)
                      }
                      required
                    />
                  </label>
                </div>
              </div>
              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Facultad</span>
                <input
                  type="text"
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  placeholder="NOMBRE DE LA FACULTAD"
                  value={formulario.facultad}
                  onChange={(e) =>
                    handleInputChange("facultad", e.target.value)
                  }
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
                disabled={guardando}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {guardando ? "Actualizando..." : "Actualizar retiro"}
              </button>
            </div>
          </form>
        </section>
      )}

      {showCancelNotice ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-800">
            Se ha cancelado esta acción
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Redirigiendo a Retiro Ciclo...
          </p>
        </div>
      ) : null}
    </main>
  );
}
