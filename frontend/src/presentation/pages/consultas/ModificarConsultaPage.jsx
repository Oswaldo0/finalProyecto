import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarConsultas,
  modificarConsulta,
  obtenerConsulta,
} from "../../../application/consultas/consultasUseCases.js";
import { AcademicCycleFields } from "../../components/shared/AcademicCycleFields.jsx";
import { normalizeByField } from "../../utils/formNormalizers.js";

const FORMULARIO_INICIAL = {
  tipoConsulta: "",
  coordinadorNombres: "",
  coordinadorApellidos: "",
  alumnoNombres: "",
  alumnoApellidos: "",
  fechaConsulta: "",
  ciclo: "",
  carrera: "",
  materia: "SIN ASIGNAR",
  consulta: "",
  respuesta: "",
};

const TIPOS_CONSULTA = [
  "ACADEMICA",
  "INSCRIPCION DE ASIGNATURAS",
  "RETIRO O REINGRESO",
  "EQUIVALENCIAS",
  "PROCESO ADMINISTRATIVO",
  "OTRA",
];

export function ModificarConsultaPage() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [consultaId, setConsultaId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [errores, setErrores] = useState({});
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoFormulario, setCargandoFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    cargarLista();
  }, []);

  async function cargarLista() {
    setCargandoLista(true);
    try {
      setLista(await listarConsultas({ limit: 100 }));
    } catch {
      setLista([]);
    } finally {
      setCargandoLista(false);
    }
  }

  const listaFiltrada = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return lista;

    return lista.filter((consulta) => {
      const texto = [
        consulta.correlativo,
        consulta.tipoConsulta,
        `${consulta.alumnoNombres ?? ""} ${consulta.alumnoApellidos ?? ""}`,
        consulta.carrera,
        consulta.fechaConsulta,
        consulta.materia,
        consulta.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termino);
    });
  }, [busqueda, lista]);

  async function seleccionarConsulta(id) {
    setCargandoFormulario(true);
    setMensajeError("");
    try {
      const consulta = await obtenerConsulta(id);
      setConsultaId(id);
      setFormulario({
        tipoConsulta: consulta.tipoConsulta ?? "",
        coordinadorNombres: consulta.coordinadorNombres ?? "",
        coordinadorApellidos: consulta.coordinadorApellidos ?? "",
        alumnoNombres: consulta.alumnoNombres ?? "",
        alumnoApellidos: consulta.alumnoApellidos ?? "",
        fechaConsulta: consulta.fechaConsulta ? consulta.fechaConsulta.slice(0, 10) : "",
        ciclo: consulta.ciclo ?? "",
        carrera: consulta.carrera ?? "",
        materia: consulta.materia ?? "SIN ASIGNAR",
        consulta: consulta.consulta ?? "",
        respuesta: consulta.respuesta ?? "",
      });
      setErrores({});
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      setMensajeError("No se pudo cargar la consulta. " + (err.message ?? ""));
    } finally {
      setCargandoFormulario(false);
    }
  }

  function handleInputChange(field, value) {
    const finalValue = normalizeByField(field, value, {
      preserve: ["fechaConsulta", "tipoConsulta"],
    });
    setFormulario((prev) => ({ ...prev, [field]: finalValue }));
    setErrores((prev) => ({ ...prev, [field]: "" }));
    setMensajeError("");
  }

  function validarFormulario() {
    const nextErrores = {};

    if (!formulario.tipoConsulta) nextErrores.tipoConsulta = "Seleccione el tipo de consulta.";
    if (!formulario.coordinadorNombres.trim()) nextErrores.coordinadorNombres = "Ingrese los nombres del coordinador.";
    if (!formulario.coordinadorApellidos.trim()) nextErrores.coordinadorApellidos = "Ingrese los apellidos del coordinador.";
    if (!formulario.alumnoNombres.trim()) nextErrores.alumnoNombres = "Ingrese los nombres del alumno.";
    if (!formulario.alumnoApellidos.trim()) nextErrores.alumnoApellidos = "Ingrese los apellidos del alumno.";
    if (!formulario.fechaConsulta) nextErrores.fechaConsulta = "Seleccione la fecha de la consulta.";
    if (!formulario.ciclo.trim()) nextErrores.ciclo = "Ingrese el ciclo academico.";
    if (!formulario.carrera.trim()) nextErrores.carrera = "Ingrese el nombre de la carrera.";
    if (!formulario.materia.trim()) nextErrores.materia = "Ingrese la materia o conserve SIN ASIGNAR.";
    if (!formulario.consulta.trim()) nextErrores.consulta = "Describa la consulta presentada.";
    if (!formulario.respuesta.trim()) nextErrores.respuesta = "Registre la respuesta brindada al estudiante.";

    setErrores(nextErrores);
    return Object.keys(nextErrores).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!consultaId || !validarFormulario()) return;

    setGuardando(true);
    setMensajeError("");
    try {
      await modificarConsulta(consultaId, formulario);
      setMensajeExito("Consulta actualizada correctamente.");
      await cargarLista();
      setTimeout(() => {
        setMensajeExito("");
        setConsultaId(null);
        setFormulario(FORMULARIO_INICIAL);
      }, 2000);
    } catch (err) {
      setMensajeError(err.message || "Error al actualizar la consulta.");
    } finally {
      setGuardando(false);
    }
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/consultas"), 1200);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">
          Historial consulta de estudiantes
        </h2>

        <div className="mt-4">
          <label className="grid gap-1 text-sm sm:max-w-md">
            <span className="font-medium text-slate-700">Buscar consultas creadas</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "1.15rem" }}>
                search
              </span>
              <input
                type="search"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Buscar por correlativo, alumno, carrera, fecha, materia o estado"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
              {busqueda ? (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Limpiar busqueda"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                    close
                  </span>
                </button>
              ) : null}
            </div>
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          {cargandoLista ? (
            <p className="px-4 py-6 text-sm text-slate-500">Cargando registros...</p>
          ) : lista.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No hay consultas registradas aun.</p>
          ) : listaFiltrada.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No se encontraron consultas con esa busqueda.</p>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Correlativo</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Alumno</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Tipo</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Fecha</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Estado</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-center text-xs font-semibold text-slate-600">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((item) => (
                  <tr
                    key={item.id}
                    className={`odd:bg-white even:bg-slate-50 ${consultaId === item.id ? "ring-2 ring-inset ring-blue-400" : ""}`}
                  >
                    <td className="border-t border-slate-200 px-4 py-2">{item.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{`${item.alumnoNombres} ${item.alumnoApellidos}`}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{item.tipoConsulta}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{item.fechaConsulta ? item.fechaConsulta.slice(0, 10) : ""}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{item.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => seleccionarConsulta(item.id)}
                        disabled={cargandoFormulario}
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        {consultaId === item.id ? "Seleccionado" : "Editar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!consultaId && !cargandoFormulario ? (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Selecciona una consulta de la lista para editarla.</p>
          </div>
        ) : null}

        {cargandoFormulario ? (
          <p className="mt-4 text-sm text-slate-500">Cargando datos del formulario...</p>
        ) : null}

        {consultaId && !cargandoFormulario ? (
          <form
            ref={formRef}
            className="mt-4 grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
            aria-label="Formulario modificar consulta"
            onSubmit={handleSubmit}
          >
            <FormSection title="Datos de atencion">
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Tipo de consulta"
                  value={formulario.tipoConsulta}
                  options={TIPOS_CONSULTA}
                  onChange={(value) => handleInputChange("tipoConsulta", value)}
                  error={errores.tipoConsulta}
                  required
                />
                <Input
                  label="Nombres del coordinador"
                  value={formulario.coordinadorNombres}
                  onChange={(value) => handleInputChange("coordinadorNombres", value)}
                  error={errores.coordinadorNombres}
                  required
                />
                <Input
                  label="Apellidos del coordinador"
                  value={formulario.coordinadorApellidos}
                  onChange={(value) => handleInputChange("coordinadorApellidos", value)}
                  error={errores.coordinadorApellidos}
                  required
                />
                <Input
                  label="Nombres del alumno"
                  value={formulario.alumnoNombres}
                  onChange={(value) => handleInputChange("alumnoNombres", value)}
                  error={errores.alumnoNombres}
                  required
                />
                <Input
                  label="Apellidos del alumno"
                  value={formulario.alumnoApellidos}
                  onChange={(value) => handleInputChange("alumnoApellidos", value)}
                  error={errores.alumnoApellidos}
                  required
                />
              </div>
            </FormSection>

            <FormSection title="Segmento de la consulta">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Fecha"
                  type="date"
                  value={formulario.fechaConsulta}
                  onChange={(value) => handleInputChange("fechaConsulta", value)}
                  error={errores.fechaConsulta}
                  required
                />
                <div className="grid gap-1">
                  <AcademicCycleFields
                    value={formulario.ciclo}
                    onChange={(value) => handleInputChange("ciclo", value)}
                    required
                  />
                  {errores.ciclo ? <span className="text-xs font-medium text-red-600">{errores.ciclo}</span> : null}
                </div>
                <Input
                  label="Nombre de la carrera"
                  value={formulario.carrera}
                  onChange={(value) => handleInputChange("carrera", value)}
                  error={errores.carrera}
                  required
                />
                <div className="grid gap-2">
                  <Input
                    label="Nombre de la materia"
                    value={formulario.materia}
                    onChange={(value) => handleInputChange("materia", value)}
                    error={errores.materia}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange("materia", "SIN ASIGNAR")}
                    className="w-fit rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
                  >
                    Materia: SIN ASIGNAR
                  </button>
                </div>
              </div>
            </FormSection>

            <FormSection title="Seguimiento de la consulta">
              <Textarea
                label="Consulta"
                value={formulario.consulta}
                onChange={(value) => handleInputChange("consulta", value)}
                error={errores.consulta}
                rows={5}
                required
              />
              <Textarea
                label="Respuesta"
                value={formulario.respuesta}
                onChange={(value) => handleInputChange("respuesta", value)}
                error={errores.respuesta}
                rows={5}
                required
              />
            </FormSection>

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
                {guardando ? "Guardando..." : "Historial consulta"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      {showCancelNotice ? (
        <Toast title="Se ha cancelado esta accion" detail="Redirigiendo a Consultas..." tone="warning" />
      ) : null}

      {mensajeExito ? <Toast title={mensajeExito} tone="success" /> : null}
      {mensajeError ? <Toast title="Error" detail={mensajeError} tone="danger" /> : null}
    </main>
  );
}

function FormSection({ title, children }) {
  return (
    <section className="grid gap-4">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, error, required = false, type = "text" }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <input
        type={type}
        className={`rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function Select({ label, value, options, onChange, error, required = false }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <select
        className={`rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Seleccione una opcion</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function Textarea({ label, value, onChange, error, rows = 4, required = false }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <textarea
        className={`resize-y rounded-lg border bg-white px-3 py-2 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${
          error ? "border-red-300" : "border-slate-300"
        }`}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </label>
  );
}

function Toast({ title, detail, tone }) {
  const palettes = {
    success: ["border-green-200 bg-green-50 text-green-800", "text-green-700"],
    warning: ["border-amber-200 bg-amber-50 text-amber-800", "text-amber-700"],
    danger: ["border-red-200 bg-red-50 text-red-800", "text-red-700"],
  };
  const [palette, detailPalette] = palettes[tone] ?? palettes.warning;

  return (
    <div className={`fixed right-4 top-20 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg ${palette}`}>
      <p className="text-sm font-semibold">{title}</p>
      {detail ? <p className={`mt-1 text-xs ${detailPalette}`}>{detail}</p> : null}
    </div>
  );
}
