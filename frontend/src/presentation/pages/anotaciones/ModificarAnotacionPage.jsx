import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FORMULARIO_INICIAL = {
  fecha: "",
  alumnoNombre: "",
  expediente: "",
  carrera: "",
  tipoAnotacion: "",
  detalle: "",
  observacion: "",
  responsable: "",
};

export function ModificarAnotacionPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

  function handleInputChange(field, value) {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/anotaciones");
    }, 1200);
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">Modificar anotación</h2>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">Sin registros disponibles</p>
          <p className="mt-1 text-xs text-blue-700">
            Este formulario queda preparado para futura recuperación de anotaciones.
            Por ahora no carga datos porque aún no existe base de datos conectada y la creación de anotaciones sigue pendiente.
          </p>
        </div>

        <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario modificar anotación" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Fecha</span><input type="date" className="rounded-lg border border-slate-300 px-3 py-2" value={formulario.fecha} onChange={(event) => handleInputChange("fecha", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Expediente</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Expediente del alumno" value={formulario.expediente} onChange={(event) => handleInputChange("expediente", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Tipo de anotación</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Tipo de anotación" value={formulario.tipoAnotacion} onChange={(event) => handleInputChange("tipoAnotacion", event.target.value)} /></label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Nombre del alumno</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del alumno" value={formulario.alumnoNombre} onChange={(event) => handleInputChange("alumnoNombre", event.target.value)} /></label>
            <label className="grid gap-1 text-sm"><span className="font-medium text-slate-700">Carrera</span><input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Carrera" value={formulario.carrera} onChange={(event) => handleInputChange("carrera", event.target.value)} /></label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Detalle de la anotación</span>
            <textarea className="min-h-[120px] rounded-lg border border-slate-300 px-3 py-2" placeholder="Detalle de la anotación" value={formulario.detalle} onChange={(event) => handleInputChange("detalle", event.target.value)} />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Observación</span>
            <textarea className="min-h-[90px] rounded-lg border border-slate-300 px-3 py-2" placeholder="Observaciones adicionales" value={formulario.observacion} onChange={(event) => handleInputChange("observacion", event.target.value)} />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Responsable</span>
            <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del responsable" value={formulario.responsable} onChange={(event) => handleInputChange("responsable", event.target.value)} />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelAction} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancelar</button>
            <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Actualizar anotación</button>
          </div>
        </form>
      </section>

      {showCancelNotice ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-800">Se ha cancelado esta acción</p>
          <p className="mt-1 text-xs text-amber-700">Redirigiendo a Anotaciones...</p>
        </div>
      ) : null}
    </main>
  );
}