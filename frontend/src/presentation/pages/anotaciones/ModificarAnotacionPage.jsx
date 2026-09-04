import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CATALOGOS_INICIALES,
  listarAnotaciones,
  modificarAnotacion,
  obtenerAnotacion,
  obtenerCatalogosAnotaciones,
} from "../../../application/anotaciones/anotacionesUseCases.js";
import { AcademicCycleFields } from "../../components/shared/AcademicCycleFields.jsx";
import { normalizeByField } from "../../utils/formNormalizers.js";

const FORMULARIO_INICIAL = {
  observador: "",
  fecha: "",
  horaInicio: "",
  horaFin: "",
  asignaturaGrupo: "",
  facultad: "",
  horario: "",
  docente: "",
  aula: "",
  ciclo: "",
  observaciones: "",
  estado: "CREADO",
};

export function ModificarAnotacionPage() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [catalogos, setCatalogos] = useState(CATALOGOS_INICIALES);
  const [lookupId, setLookupId] = useState(routeId ?? "");
  const [lista, setLista] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoLista, setCargandoLista] = useState(true);
  const [loadedId, setLoadedId] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [showCancelNotice, setShowCancelNotice] = useState(false);

  useEffect(() => {
    let mounted = true;
    obtenerCatalogosAnotaciones().then((result) => {
      if (mounted) setCatalogos(result);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (routeId) cargarAnotacion(routeId);
  }, [routeId]);

  useEffect(() => {
    listarAnotaciones()
      .then(setLista)
      .catch(() => setLista([]))
      .finally(() => setCargandoLista(false));
  }, []);

  const listaFiltrada = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return lista;

    return lista.filter((anotacion) => {
      const texto = [
        anotacion.correlativo,
        anotacion.observador,
        anotacion.fecha,
        anotacion.asignaturaGrupo,
        anotacion.facultad,
        anotacion.horario,
        anotacion.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termino);
    });
  }, [busqueda, lista]);

  async function cargarAnotacion(id) {
    if (!id) return;
    setCargando(true);
    setMensajeError("");
    setMensajeExito("");

    try {
      const anotacion = await obtenerAnotacion(id);
      setLoadedId(anotacion.id);
      setLookupId(String(anotacion.id));
      setFormulario({
        observador: anotacion.observador ?? "",
        fecha: formatDateInput(anotacion.fecha),
        horaInicio: anotacion.horaInicio ?? "",
        horaFin: anotacion.horaFin ?? "",
        asignaturaGrupo: anotacion.asignaturaGrupo ?? "",
        facultad: anotacion.facultad ?? "",
        horario: anotacion.horario ?? "",
        docente: anotacion.docente ?? "",
        aula: anotacion.aula ?? "",
        ciclo: anotacion.ciclo ?? "",
        observaciones: anotacion.observaciones ?? "",
        estado: anotacion.estado ?? "CREADO",
      });
    } catch (err) {
      setLoadedId(null);
      setMensajeError(err.message || "No se pudo cargar la anotación.");
    } finally {
      setCargando(false);
    }
  }

  function handleInputChange(field, value) {
    const finalValue = normalizeByField(field, value, { preserve: ["fecha", "estado"] });
    setFormulario((prev) => ({ ...prev, [field]: finalValue }));
  }

  function handleBuscar(event) {
    event.preventDefault();
    if (!lookupId.trim()) {
      setMensajeError("Ingrese el ID de una anotación.");
      return;
    }
    navigate(`/anotaciones/modificar/${lookupId.trim()}`);
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => navigate("/anotaciones"), 1200);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    if (!loadedId) {
      setMensajeError("Debe cargar una anotación antes de actualizar.");
      return;
    }

    setGuardando(true);
    try {
      await modificarAnotacion(loadedId, formulario);
      setMensajeExito("Anotación actualizada correctamente.");
    } catch (err) {
      setMensajeError(err.message || "No se pudo actualizar la anotación.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold uppercase tracking-wide text-slate-800">
            Historial anotación
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Busque una observación registrada y actualice los datos académicos correspondientes.
          </p>
        </div>

        <div className="mt-4">
          <label className="grid gap-1 text-sm sm:max-w-md">
            <span className="font-medium text-slate-700">Buscar reportes creados</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "1.15rem" }}>search</span>
              <input
                type="search"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Buscar por correlativo, observador, asignatura, facultad, fecha o estado"
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
            <p className="px-4 py-6 text-sm text-slate-500">No hay anotaciones registradas aún.</p>
          ) : listaFiltrada.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No se encontraron anotaciones con esa búsqueda.</p>
          ) : (
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Correlativo</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Fecha</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Observador</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Asignatura/grupo</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-left text-xs font-semibold text-slate-600">Estado</th>
                  <th className="border-b border-slate-200 px-4 py-2 text-center text-xs font-semibold text-slate-600">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((anotacion) => (
                  <tr key={anotacion.id} className={`odd:bg-white even:bg-slate-50 ${loadedId === anotacion.id ? "ring-2 ring-inset ring-blue-400" : ""}`}>
                    <td className="border-t border-slate-200 px-4 py-2">{anotacion.correlativo}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{anotacion.fecha}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{anotacion.observador}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{anotacion.asignaturaGrupo}</td>
                    <td className="border-t border-slate-200 px-4 py-2">{anotacion.estado}</td>
                    <td className="border-t border-slate-200 px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => cargarAnotacion(anotacion.id)}
                        disabled={cargando}
                        className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        {loadedId === anotacion.id ? "Seleccionado" : "Editar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loadedId && !cargando ? (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-semibold text-blue-800">Selecciona una anotación de la lista para editarla.</p>
          </div>
        ) : null}

        {loadedId && !cargando ? (
        <form className="mt-4 grid gap-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario modificar observación de clases" onSubmit={handleSubmit}>
          {showCancelNotice ? <Toast title="Se ha cancelado esta acción" detail="Redirigiendo a Anotaciones..." tone="warning" /> : null}
          {mensajeExito ? <Toast title={mensajeExito} detail="Los cambios fueron guardados." tone="success" /> : null}
          {mensajeError ? <Toast title="No se pudo completar la acción" detail={mensajeError} tone="error" /> : null}
          <FormSection title="Datos generales">
            <RadioGroup
              number="1"
              label="Observador"
              required
              value={formulario.observador}
              options={catalogos.observadores}
              onChange={(value) => handleInputChange("observador", value)}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input number="2" label="Fecha de observación" type="date" required value={formulario.fecha} onChange={(value) => handleInputChange("fecha", value)} />
              <Input number="3" label="Hora de inicio de observación" helper="Ejemplo: 8:30 a.m., 8:30 p.m." required value={formulario.horaInicio} onChange={(value) => handleInputChange("horaInicio", value)} />
              <Input number="4" label="Hora de fin de observación" helper="Ejemplo: 8:30 a.m., 8:30 p.m." required value={formulario.horaFin} onChange={(value) => handleInputChange("horaFin", value)} />
            </div>

            <Input number="5" label="Asignatura/grupo" required value={formulario.asignaturaGrupo} onChange={(value) => handleInputChange("asignaturaGrupo", value)} />

            <RadioGroup
              number="6"
              label="Facultad / escuela a la que pertenece"
              required
              value={formulario.facultad}
              options={catalogos.facultades}
              onChange={(value) => handleInputChange("facultad", value)}
            />
          </FormSection>

          <FormSection title="Información de la clase">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select label="Horario" required value={formulario.horario} options={catalogos.horarios} onChange={(value) => handleInputChange("horario", value)} />
              <Input label="Docente observado" required value={formulario.docente} onChange={(value) => handleInputChange("docente", value)} />
              <Input label="Aula" required value={formulario.aula} onChange={(value) => handleInputChange("aula", value)} />
              <AcademicCycleFields
                value={formulario.ciclo}
                onChange={(value) => handleInputChange("ciclo", value)}
                required
              />
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Observaciones</span>
              <textarea
                className="min-h-[140px] rounded-lg border border-slate-300 px-3 py-2 leading-relaxed"
                placeholder="Detalle de la observación"
                value={formulario.observaciones}
                onChange={(event) => handleInputChange("observaciones", event.target.value)}
                required
              />
            </label>
          </FormSection>

          <FormSection title="Estado">
            <Select
              label="Estado del documento"
              value={formulario.estado}
              options={["CREADO", "EMITIDA", "IMPRESO", "ANULADA"]}
              onChange={(value) => handleInputChange("estado", value)}
            />
          </FormSection>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelAction} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Cancelar
            </button>
            <button type="submit" disabled={!loadedId || guardando} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
              {guardando ? "Guardando..." : "Historial anotación"}
            </button>
          </div>
        </form>
        ) : null}
      </section>
    </main>
  );
}

function formatDateInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function FormSection({ title, children }) {
  return (
    <section className="grid gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</h3>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, number, helper, type = "text", required = false }) {
  return (
    <label className="grid flex-1 gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {number ? `${number}. ` : ""}
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      {helper ? <span className="text-xs text-slate-500">{helper}</span> : null}
      <input
        type={type}
        className="rounded-lg border border-slate-300 px-3 py-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

function Select({ label, value, options, onChange, required = false }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <select className="rounded-lg border border-slate-300 bg-white px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">Seleccione una opción</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RadioGroup({ number, label, value, options, onChange, required = false }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium text-slate-700">
        {number}. {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </legend>
      <div className="grid gap-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-300">
            <input type="radio" checked={value === option} onChange={() => onChange(option)} required={required && !value} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Toast({ title, detail, tone }) {
  const styles = {
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${styles[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs">{detail}</p>
    </div>
  );
}
