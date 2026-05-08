import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ASIGNATURAS_INICIALES = [
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
];

const FORMULARIO_INICIAL = {
  secretarioNombre: "",
  decanoNombre: "",
  fecha: "",
  cantidadAniosEgreso: "",
  cicloReingreso: "",
  alumnoNombre: "",
  carreraNombre: "",
  mesEgreso: "",
  anioEgreso: "",
  aniosEgresado: "",
};

export function ModificarPenalidadPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [asignaturas, setAsignaturas] = useState(ASIGNATURAS_INICIALES);

  function handleInputChange(field, value) {
    setFormulario((prev) => ({ ...prev, [field]: value }));
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
    setTimeout(() => {
      navigate("/penalidad");
    }, 1200);
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">Modificar penalidad</h2>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">Sin registros disponibles</p>
          <p className="mt-1 text-xs text-blue-700">
            Este formulario está preparado para recuperar la información de Crear penalidad,
            pero por ahora no carga datos porque todavía no hay base de datos conectada.
          </p>
        </div>

        <form
          className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
          aria-label="Formulario modificar penalidad"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Para (Nombre del Secretario)</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Nombre del Secretario"
                value={formulario.secretarioNombre}
                onChange={(event) => handleInputChange("secretarioNombre", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">De (Nombre del Decano)</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Nombre del Decano"
                value={formulario.decanoNombre}
                onChange={(event) => handleInputChange("decanoNombre", event.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Fecha</span>
              <input
                type="date"
                className="rounded-lg border border-slate-300 px-3 py-2"
                value={formulario.fecha}
                onChange={(event) => handleInputChange("fecha", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Cantidad de años de egreso</span>
              <input
                type="number"
                min="0"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ej. 6"
                value={formulario.cantidadAniosEgreso}
                onChange={(event) => handleInputChange("cantidadAniosEgreso", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Ciclo de reingreso</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ej. I-2026"
                value={formulario.cicloReingreso}
                onChange={(event) => handleInputChange("cicloReingreso", event.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre del alumno</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Nombre del alumno"
                value={formulario.alumnoNombre}
                onChange={(event) => handleInputChange("alumnoNombre", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre de la carrera</span>
              <input
                type="text"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Nombre de la carrera"
                value={formulario.carreraNombre}
                onChange={(event) => handleInputChange("carreraNombre", event.target.value)}
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
                onChange={(event) => handleInputChange("mesEgreso", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Año de egreso</span>
              <input
                type="number"
                min="1900"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ej. 2019"
                value={formulario.anioEgreso}
                onChange={(event) => handleInputChange("anioEgreso", event.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Años de egresado</span>
              <input
                type="number"
                min="0"
                className="rounded-lg border border-slate-300 px-3 py-2"
                placeholder="Ej. 6"
                value={formulario.aniosEgresado}
                onChange={(event) => handleInputChange("aniosEgresado", event.target.value)}
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas a cursar</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px]">
              {asignaturas.map((asignatura, index) => (
                <>
                  <input
                    key={`asignatura-${index}`}
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder={`Asignatura ${index + 1}`}
                    value={asignatura.nombre}
                    onChange={(event) => handleAsignaturaChange(index, "nombre", event.target.value)}
                  />
                  <input
                    key={`uv-${index}`}
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="UV"
                    value={asignatura.uv}
                    onChange={(event) => handleAsignaturaChange(index, "uv", event.target.value)}
                  />
                </>
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
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Actualizar penalidad
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
    </main>
  );
}