import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MATERIAS_INICIALES = [
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
  { nombre: "", uv: "" },
];

export function CrearRetiroCicloPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [materias, setMaterias] = useState(MATERIAS_INICIALES);

  function handleMateriaChange(index, field, value) {
    setMaterias((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/retiro-ciclo");
    }, 1200);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-700">Crear retiro de ciclo</h2>

        <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-label="Formulario crear retiro de ciclo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Expediente</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. 20240001" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Carnet</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Código del alumno" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Fecha</span>
              <input type="date" className="rounded-lg border border-slate-300 px-3 py-2" required />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre del alumno</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre completo" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Carrera</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre de la carrera" required />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Ciclo a retirar</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. I-2026" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Artículo de referencia</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Ej. Artículo 14" defaultValue="Artículo 14" />
            </label>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Texto de resolución</span>
            <textarea
              className="min-h-[100px] rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Texto base de la autorización del retiro"
              defaultValue="De acuerdo a su solicitud y en base al artículo 14 del Reglamento de Administración Académica, se autoriza al bachiller, previo al pago del arancel correspondiente, el retiro extraordinario de las asignaturas inscritas en el ciclo indicado."
            />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Asignaturas inscritas</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px]">
              {materias.map((materia, index) => (
                <>
                  <input
                    key={`materia-${index}`}
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder={`Asignatura ${index + 1}`}
                    value={materia.nombre}
                    onChange={(event) =>
                      handleMateriaChange(index, "nombre", event.target.value)
                    }
                  />
                  <input
                    key={`uv-${index}`}
                    type="text"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="UV"
                    value={materia.uv}
                    onChange={(event) =>
                      handleMateriaChange(index, "uv", event.target.value)
                    }
                  />
                </>
              ))}
            </div>
          </div>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Observación final</span>
            <textarea
              className="min-h-[80px] rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Ej. Se autoriza retiro del ciclo con exoneración de cuota pendiente."
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Nombre del decano</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre del decano" required />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Facultad</span>
              <input type="text" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Nombre de la facultad" required />
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
            <button type="submit" className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
              Guardar retiro
            </button>
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
