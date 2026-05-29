import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TABLA_INICIAL = [
  {
    asignaturaCursada: "",
    uv: "",
    nota: "",
    institucion: "",
    asignaturaSolicitada: "",
    ap: false,
    de: false,
  },
];

export function ModificarEquivalenciaPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [tabla, setTabla] = useState(TABLA_INICIAL);
  const [nombre, setNombre] = useState("");
  const [carrerasCursadas, setCarrerasCursadas] = useState("");
  const [carreraDestino, setCarreraDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [nombreAlumno, setNombreAlumno] = useState("");
  const [textoSolicitud, setTextoSolicitud] = useState(
    "Señor Decano de la Facultad de INGENIERÍA, por medio de la presente solicito se me conceda por equivalencias las materias siguientes:",
  );
  const [notasReservado, setNotasReservado] = useState("");
  const [nombreDecano, setNombreDecano] = useState("");
  const [fechaDecano, setFechaDecano] = useState("");

  function normalizeTablaField(field, value) {
    if (
      field === "asignaturaCursada" ||
      field === "asignaturaSolicitada" ||
      field === "institucion"
    ) {
      return String(value).toUpperCase();
    }

    if (field === "uv") {
      const raw = String(value).trim();
      if (raw === "") return "";
      const numeric = Number(raw);
      if (!Number.isInteger(numeric)) return "";
      if (numeric < 1 || numeric > 9) return "";
      return String(numeric);
    }

    if (field === "nota") {
      const raw = String(value).trim();
      if (raw === "") return "";
      const numeric = Number(raw);
      if (Number.isNaN(numeric) || numeric < 0) return "";
      return raw;
    }

    return value;
  }

  function handleTablaChange(index, field, value) {
    setTabla((prev) =>
      prev.map((row, itemIndex) =>
        itemIndex === index ? { ...row, [field]: normalizeTablaField(field, value) } : row,
      ),
    );
  }

  function handleCheckbox(index, field) {
    setTabla((prev) =>
      prev.map((row, itemIndex) => {
        if (itemIndex !== index) return row;

        if (field === "ap") {
          return row.ap ? { ...row, ap: false } : { ...row, ap: true, de: false };
        }

        if (field === "de") {
          return row.de ? { ...row, de: false } : { ...row, de: true, ap: false };
        }

        return row;
      }),
    );
  }

  function agregarFila() {
    setTabla((prev) => [
      ...prev,
      {
        asignaturaCursada: "",
        uv: "",
        nota: "",
        institucion: "",
        asignaturaSolicitada: "",
        ap: false,
        de: false,
      },
    ]);
  }

  function eliminarFila(index) {
    setTabla((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/equivalencias");
    }, 1200);
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      {showCancelNotice ? (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded border border-yellow-400 bg-yellow-100 px-6 py-3 text-sm font-medium text-yellow-800 shadow-lg">
          Operación cancelada. Redirigiendo…
        </div>
      ) : null}

      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <div className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-800">Sin registros disponibles</p>
          <p className="mt-1 text-xs text-blue-700">
            Este formulario está listo para recuperar la información de Crear equivalencia,
            pero por ahora no muestra datos porque aún no existe conexión a base de datos.
          </p>
        </div>

        <div className="mb-6 border border-gray-400 py-3 text-center">
          <h1 className="text-lg font-bold uppercase tracking-wide">Universidad de Sonsonate — Modificar Equivalencias</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-700">Asignaturas</p>
              <button
                type="button"
                onClick={agregarFila}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                  add
                </span>
                Agregar fila
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-black text-xs">
                <thead>
                  <tr style={{ backgroundColor: "#AD0209" }} className="text-white">
                    <th className="border-2 border-black px-2 py-1 text-left">Asignatura Cursada</th>
                    <th className="w-12 border-2 border-black px-2 py-1 text-center">U.V</th>
                    <th className="w-16 border-2 border-black px-2 py-1 text-center">Nota</th>
                    <th className="border-2 border-black px-2 py-1 text-left">Institución donde se cursó</th>
                    <th className="border-2 border-black px-2 py-1 text-left">Asignatura Solicitada</th>
                    <th className="w-10 border-2 border-black px-2 py-1 text-center">AP</th>
                    <th className="w-10 border-2 border-black px-2 py-1 text-center">DE</th>
                    <th className="w-16 border-2 border-black px-2 py-1 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-2 border-black px-1 py-0.5"><input className="w-full bg-transparent text-xs outline-none" value={row.asignaturaCursada} onChange={(event) => handleTablaChange(index, "asignaturaCursada", event.target.value)} placeholder="Asignatura cursada" /></td>
                      <td className="border-2 border-black px-1 py-0.5"><input type="number" min="1" max="9" step="1" inputMode="numeric" className="w-full bg-transparent text-center text-xs outline-none" value={row.uv} onChange={(event) => handleTablaChange(index, "uv", event.target.value)} onKeyDown={(event) => { if (["e", "+", "-", "."].includes(event.key)) { event.preventDefault(); } }} placeholder="U.V" /></td>
                      <td className="border-2 border-black px-1 py-0.5"><input type="number" min="0" step="0.1" inputMode="decimal" className="w-full bg-transparent text-center text-xs outline-none" value={row.nota} onChange={(event) => handleTablaChange(index, "nota", event.target.value)} onKeyDown={(event) => { if (["e", "+", "-"].includes(event.key)) { event.preventDefault(); } }} placeholder="Nota" /></td>
                      <td className="border-2 border-black px-1 py-0.5"><input className="w-full bg-transparent text-xs outline-none" value={row.institucion} onChange={(event) => handleTablaChange(index, "institucion", event.target.value)} placeholder="Institución" /></td>
                      <td className="border-2 border-black px-1 py-0.5"><input className="w-full bg-transparent text-xs outline-none" value={row.asignaturaSolicitada} onChange={(event) => handleTablaChange(index, "asignaturaSolicitada", event.target.value)} placeholder="Asignatura solicitada" /></td>
                      <td className="border-2 border-black px-1 py-0.5 text-center"><input type="checkbox" checked={row.ap} onChange={() => handleCheckbox(index, "ap")} className="accent-blue-600" /></td>
                      <td className="border-2 border-black px-1 py-0.5 text-center"><input type="checkbox" checked={row.de} onChange={() => handleCheckbox(index, "de")} className="accent-blue-600" /></td>
                      <td className="border-2 border-black px-1 py-0.5 text-center">
                        <button
                          type="button"
                          onClick={() => eliminarFila(index)}
                          disabled={tabla.length === 1}
                          className="rounded px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-40"
                          aria-label={`Eliminar fila ${index + 1}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-xs text-gray-500">AP = Aprobada | DE = Denegada</p>
          </div>

          <div className="rounded border border-gray-300 bg-gray-50 p-4">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">Texto de solicitud</label>
            <textarea className="w-full resize-y rounded border border-gray-300 bg-white px-3 py-2 text-base leading-relaxed text-gray-800 outline-none focus:border-blue-400" rows={4} value={textoSolicitud} onChange={(event) => setTextoSolicitud(event.target.value)} />
          </div>

          <div className="space-y-4 rounded border border-gray-400 p-5">
            <h2 className="text-center text-sm font-bold uppercase tracking-wide">Reservado para la Universidad</h2>
            <textarea className="w-full resize-none border-b border-gray-400 bg-transparent text-sm outline-none" rows={4} value={notasReservado} onChange={(event) => setNotasReservado(event.target.value)} placeholder="Notas internas…" />
            <div className="mt-2 flex items-end gap-6">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-600">Nombre del Decano</label>
                <input className="w-full border-b border-gray-500 text-sm outline-none" value={nombreDecano} onChange={(event) => setNombreDecano(event.target.value)} placeholder="Nombre del decano" />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-600">Fecha</label>
                <input type="date" className="w-full border-b border-gray-500 text-sm outline-none" value={fechaDecano} onChange={(event) => setFechaDecano(event.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded border border-gray-700 bg-gray-800 p-5 text-white">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Nombre</label>
              <input className="mt-1 w-full border-b border-gray-500 bg-transparent text-sm text-white outline-none" value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Nombre del alumno" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Carrera(s) Cursada(s)</label>
              <input className="mt-1 w-full border-b border-gray-500 bg-transparent text-sm text-white outline-none" value={carrerasCursadas} onChange={(event) => setCarrerasCursadas(event.target.value)} placeholder="Carrera(s) de origen" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Carrera que estudia o pretende estudiar</label>
              <input className="mt-1 w-full border-b border-gray-500 bg-transparent text-sm text-white outline-none" value={carreraDestino} onChange={(event) => setCarreraDestino(event.target.value)} placeholder="Carrera destino" />
            </div>
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Fecha</label>
                <input type="date" className="mt-1 w-full border-b border-gray-500 bg-transparent text-sm text-white outline-none" value={fecha} onChange={(event) => setFecha(event.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Nombre del Alumno</label>
                <input className="mt-1 w-full border-b border-gray-500 bg-transparent text-sm text-white outline-none" value={nombreAlumno} onChange={(event) => setNombreAlumno(event.target.value)} placeholder="Nombre del alumno" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleCancelAction} className="rounded border border-gray-400 px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="rounded bg-blue-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-800">Actualizar equivalencia</button>
          </div>
        </form>
      </div>
    </div>
  );
}