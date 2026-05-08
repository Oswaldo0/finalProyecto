import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TABLA_ABSORCION_INICIAL = Array.from({ length: 8 }, () => ({
  asignaturaCursada: "",
  asignaturaAbsorbida: "",
  notaAsignada: "",
}));

const TABLA_NO_EXISTE_INICIAL = Array.from({ length: 6 }, () => ({
  asignatura: "",
  nota: "",
}));

const TABLA_REPROBADAS_INICIAL = Array.from({ length: 3 }, () => ({
  asignatura: "",
  nota: "",
}));

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
    "El Decano de la Facultad informa que el bachiller ha solicitado absorción al plan solicitado y, de acuerdo al Reglamento de Administración Académica y Reglamento de Equivalencias, se dictamina absorber las asignaturas detalladas.",
  decanoNombre: "",
  facultadFirma: "",
};

export function ModificarAbsorcionPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [tablaAbsorcion, setTablaAbsorcion] = useState(TABLA_ABSORCION_INICIAL);
  const [tablaNoExiste, setTablaNoExiste] = useState(TABLA_NO_EXISTE_INICIAL);
  const [tablaReprobadas, setTablaReprobadas] = useState(TABLA_REPROBADAS_INICIAL);

  function handleInputChange(field, value) {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  }

  function handleAbsorcionChange(index, field, value) {
    setTablaAbsorcion((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  }

  function handleNoExisteChange(index, field, value) {
    setTablaNoExiste((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  }

  function handleReprobadasChange(index, field, value) {
    setTablaReprobadas((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/absorciones");
    }, 1200);
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">Modificar absorción</h2>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">Sin registros disponibles</p>
          <p className="mt-1 text-xs text-blue-700">
            Este formulario está listo para recuperar la información de Crear absorción,
            pero todavía no hay base de datos conectada para mostrar registros existentes.
          </p>
        </div>

        <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario modificar absorción" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Facultad</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. Ingeniería" value={formulario.facultad} onChange={(event) => handleInputChange("facultad", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Ciclo</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. I-2026" value={formulario.ciclo} onChange={(event) => handleInputChange("ciclo", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Fecha</span><input type="date" className="rounded-lg border border-slate-300 px-3 py-2" value={formulario.fecha} onChange={(event) => handleInputChange("fecha", event.target.value)} /></label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Nombre del alumno</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre completo" value={formulario.nombreAlumno} onChange={(event) => handleInputChange("nombreAlumno", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Apellidos del alumno</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Apellidos" value={formulario.apellidosAlumno} onChange={(event) => handleInputChange("apellidosAlumno", event.target.value)} /></label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Carrera de origen</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Carrera de origen" value={formulario.carreraOrigen} onChange={(event) => handleInputChange("carreraOrigen", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Plan de origen</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Plan de origen" value={formulario.planOrigen} onChange={(event) => handleInputChange("planOrigen", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Plan solicitado</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Plan solicitado" value={formulario.planSolicitado} onChange={(event) => handleInputChange("planSolicitado", event.target.value)} /></label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Encabezado del dictamen</span>
            <textarea className="min-h-[90px] rounded-lg border border-slate-300 px-3 py-2" value={formulario.encabezadoDictamen} onChange={(event) => handleInputChange("encabezadoDictamen", event.target.value)} />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas absorbidas</h3>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100"><tr><th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura cursada</th><th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura absorbida</th><th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Nota asignada</th></tr></thead>
                <tbody>{tablaAbsorcion.map((item, index) => (<tr key={`abs-${index}`} className="odd:bg-white even:bg-slate-50"><td className="border-t border-slate-200 px-2 py-1.5"><input type="text" className="w-full rounded-md border border-slate-300 px-2 py-1" value={item.asignaturaCursada} onChange={(event) => handleAbsorcionChange(index, "asignaturaCursada", event.target.value)} placeholder="Asignatura" /></td><td className="border-t border-slate-200 px-2 py-1.5"><input type="text" className="w-full rounded-md border border-slate-300 px-2 py-1" value={item.asignaturaAbsorbida} onChange={(event) => handleAbsorcionChange(index, "asignaturaAbsorbida", event.target.value)} placeholder="Asignatura" /></td><td className="border-t border-slate-200 px-2 py-1.5"><input type="text" className="w-full rounded-md border border-slate-300 px-2 py-1" value={item.notaAsignada} onChange={(event) => handleAbsorcionChange(index, "notaAsignada", event.target.value)} placeholder="Nota" /></td></tr>))}</tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Pierde por no existir en plan solicitado</h3>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100"><tr><th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura</th><th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Nota</th></tr></thead>
                <tbody>{tablaNoExiste.map((item, index) => (<tr key={`no-existe-${index}`} className="odd:bg-white even:bg-slate-50"><td className="border-t border-slate-200 px-2 py-1.5"><input type="text" className="w-full rounded-md border border-slate-300 px-2 py-1" value={item.asignatura} onChange={(event) => handleNoExisteChange(index, "asignatura", event.target.value)} placeholder="Asignatura" /></td><td className="border-t border-slate-200 px-2 py-1.5"><input type="text" className="w-full rounded-md border border-slate-300 px-2 py-1" value={item.nota} onChange={(event) => handleNoExisteChange(index, "nota", event.target.value)} placeholder="Nota" /></td></tr>))}</tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas cursadas, reprobadas y absorbidas</h3>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100"><tr><th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Asignatura</th><th className="border-b border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Nota</th></tr></thead>
                <tbody>{tablaReprobadas.map((item, index) => (<tr key={`rep-${index}`} className="odd:bg-white even:bg-slate-50"><td className="border-t border-slate-200 px-2 py-1.5"><input type="text" className="w-full rounded-md border border-slate-300 px-2 py-1" value={item.asignatura} onChange={(event) => handleReprobadasChange(index, "asignatura", event.target.value)} placeholder="Asignatura" /></td><td className="border-t border-slate-200 px-2 py-1.5"><input type="text" className="w-full rounded-md border border-slate-300 px-2 py-1" value={item.nota} onChange={(event) => handleReprobadasChange(index, "nota", event.target.value)} placeholder="Nota" /></td></tr>))}</tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Nombre del decano</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del decano" value={formulario.decanoNombre} onChange={(event) => handleInputChange("decanoNombre", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Facultad que firma</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Facultad" value={formulario.facultadFirma} onChange={(event) => handleInputChange("facultadFirma", event.target.value)} /></label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelAction} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancelar</button>
            <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Actualizar absorción</button>
          </div>
        </form>
      </section>

      {showCancelNotice ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-800">Se ha cancelado esta acción</p>
          <p className="mt-1 text-xs text-amber-700">Redirigiendo a Absorciones...</p>
        </div>
      ) : null}
    </main>
  );
}