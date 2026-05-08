import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

const MATERIAS_INICIALES = [
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
];

const FORMULARIO_INICIAL = {
  expediente: "",
  carnet: "",
  fecha: "",
  alumnoNombre: "",
  carrera: "",
  cicloRetirar: "",
  articuloReferencia: "Artículo 14",
  textoResolucion:
    "De acuerdo a su solicitud y en base al artículo 14 del Reglamento de Administración Académica, se autoriza al bachiller, previo al pago del arancel correspondiente, el retiro extraordinario de las asignaturas inscritas en el ciclo indicado.",
  observacionFinal: "",
  decanoNombre: "",
  facultad: "",
};

export function ModificarRetiroCicloPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [materias, setMaterias] = useState(MATERIAS_INICIALES);

  function handleInputChange(field, value) {
    setFormulario((prev) => ({ ...prev, [field]: value }));
  }

  function handleMateriaChange(index, field, value) {
    setMaterias((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/retiro-ciclo");
    }, 1200);
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">Modificar retiro de ciclo</h2>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">Sin registros disponibles</p>
          <p className="mt-1 text-xs text-blue-700">
            Este formulario está preparado para recuperar la información de Crear retiro de ciclo,
            pero aún no hay base de datos conectada para cargar registros existentes.
          </p>
        </div>

        <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario modificar retiro de ciclo" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Expediente</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. 20240001" value={formulario.expediente} onChange={(event) => handleInputChange("expediente", event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Carnet</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Código del alumno" value={formulario.carnet} onChange={(event) => handleInputChange("carnet", event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Fecha</span>
              <input type="date" className="rounded-lg border border-slate-300 px-3 py-2" value={formulario.fecha} onChange={(event) => handleInputChange("fecha", event.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre del alumno</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre completo" value={formulario.alumnoNombre} onChange={(event) => handleInputChange("alumnoNombre", event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Carrera</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre de la carrera" value={formulario.carrera} onChange={(event) => handleInputChange("carrera", event.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Ciclo a retirar</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. I-2026" value={formulario.cicloRetirar} onChange={(event) => handleInputChange("cicloRetirar", event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Artículo de referencia</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" value={formulario.articuloReferencia} onChange={(event) => handleInputChange("articuloReferencia", event.target.value)} />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Texto de resolución</span>
            <textarea className="min-h-[100px] rounded-lg border border-slate-300 px-3 py-2" value={formulario.textoResolucion} onChange={(event) => handleInputChange("textoResolucion", event.target.value)} />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas inscritas</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px]">
              {materias.map((materia, index) => (
                <Fragment key={index}>
                  <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder={`Asignatura ${index + 1}`} value={materia.nombre} onChange={(event) => handleMateriaChange(index, "nombre", event.target.value)} />
                  <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="UV" value={materia.uv} onChange={(event) => handleMateriaChange(index, "uv", event.target.value)} />
                </Fragment>
              ))}
            </div>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Observación final</span>
            <textarea className="min-h-[80px] rounded-lg border border-slate-300 px-3 py-2" placeholder="Observación final" value={formulario.observacionFinal} onChange={(event) => handleInputChange("observacionFinal", event.target.value)} />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre del decano</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del decano" value={formulario.decanoNombre} onChange={(event) => handleInputChange("decanoNombre", event.target.value)} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Facultad</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre de la facultad" value={formulario.facultad} onChange={(event) => handleInputChange("facultad", event.target.value)} />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelAction} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancelar</button>
            <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Actualizar retiro</button>
          </div>
        </form>
      </section>

      {showCancelNotice ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-amber-800">Se ha cancelado esta acción</p>
          <p className="mt-1 text-xs text-amber-700">Redirigiendo a Retiro Ciclo...</p>
        </div>
      ) : null}
    </main>
  );
}