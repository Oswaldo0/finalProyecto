import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearEquivalencia } from "../../../application/equivalencias/equivalenciasUseCases.js";

const FILAS_TABLA = 10;

const TABLA_INICIAL = Array.from({ length: FILAS_TABLA }, () => ({
  asignaturaCursada: "",
  uv: "",
  nota: "",
  institucion: "",
  asignaturaSolicitada: "",
  ap: false,
  de: false,
}));

export function CrearEquivalenciaPage() {
  const navigate = useNavigate();
  const [showCancelNotice, setShowCancelNotice] = useState(false);
  const [tabla, setTabla] = useState(TABLA_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const [nombre, setNombre] = useState("");
  const [carrerasCursadas, setCarrerasCursadas] = useState("");
  const [carreraDestino, setCarreraDestino] = useState("");
  const [fecha, setFecha] = useState("");
  const [firmaAlumno, setFirmaAlumno] = useState("");

  const [textoSolicitud, setTextoSolicitud] = useState(
    "Señor Decano de la Facultad de INGENIERÍA, por medio de la presente solicito se me conceda por equivalencias las materias siguientes:",
  );
  const [notasReservado, setNotasReservado] = useState("");
  const [firmaDecano, setFirmaDecano] = useState("");
  const [fechaDecano, setFechaDecano] = useState("");

  function handleTablaChange(index, field, value) {
    setTabla((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function handleCheckbox(index, field) {
    setTabla((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: !row[field] } : row,
      ),
    );
  }

  function handleCancelAction() {
    setShowCancelNotice(true);
    setTimeout(() => {
      navigate("/equivalencias");
    }, 1200);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito("");
    setMensajeError("");
    try {
      const detalles = tabla
        .filter((row) => row.asignaturaCursada.trim() !== "" && row.asignaturaSolicitada.trim() !== "")
        .map((row) => ({
          asignatura_cursada: row.asignaturaCursada.trim(),
          uv: row.uv !== "" ? Number(row.uv) : null,
          nota: row.nota !== "" ? Number(row.nota) : null,
          institucion_nombre: row.institucion.trim() || null,
          asignatura_solicitada: row.asignaturaSolicitada.trim(),
          resultado: row.ap ? "APROBADA" : row.de ? "DENEGADA" : "PENDIENTE",
        }));

      const payload = {
        equivalencia: {
          fecha_solicitud: fecha || null,
          alumno_nombre: nombre.trim(),
          carreras_cursadas: carrerasCursadas.trim() || null,
          carrera_destino: carreraDestino.trim() || null,
          texto_solicitud: textoSolicitud.trim(),
          notas_universidad: notasReservado.trim() || null,
          decano_nombre: firmaDecano.trim() || null,
          fecha_decano: fechaDecano || null,
          alumno_nombre_firma: firmaAlumno.trim() || null,
          estado: "BORRADOR",
        },
        detalles,
      };

      await crearEquivalencia(payload);
      setMensajeExito("Equivalencia guardada correctamente.");
      setTabla(TABLA_INICIAL);
      setNombre("");
      setCarrerasCursadas("");
      setCarreraDestino("");
      setFecha("");
      setFirmaAlumno("");
      setNotasReservado("");
      setFirmaDecano("");
      setFechaDecano("");
      setTimeout(() => navigate("/equivalencias/imprimir"), 1200);
    } catch (err) {
      setMensajeError(err.message || "Error al guardar la equivalencia.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {showCancelNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded shadow-lg text-sm font-medium">
          Operación cancelada. Redirigiendo…
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Título */}
        <div className="border border-gray-400 text-center py-3 mb-6">
          <h1 className="text-lg font-bold uppercase tracking-wide">
            Universidad de Sonsonate — Solicitud de Equivalencias
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {mensajeExito && (
            <div className="rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700">
              {mensajeExito}
            </div>
          )}
          {mensajeError && (
            <div className="rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
              {mensajeError}
            </div>
          )}

          {/* Tabla de asignaturas */}
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-2 border-black">
                <thead>
                  <tr style={{ backgroundColor: "#AD0209" }} className="text-white">
                    <th className="border-2 border-black px-2 py-1 text-left">Asignatura Cursada</th>
                    <th className="border-2 border-black px-2 py-1 text-center w-12">U.V</th>
                    <th className="border-2 border-black px-2 py-1 text-center w-16">Nota</th>
                    <th className="border-2 border-black px-2 py-1 text-left">Institución donde se cursó</th>
                    <th className="border-2 border-black px-2 py-1 text-left">Asignatura Solicitada</th>
                    <th className="border-2 border-black px-2 py-1 text-center w-10">AP</th>
                    <th className="border-2 border-black px-2 py-1 text-center w-10">DE</th>
                  </tr>
                </thead>
                <tbody>
                  {tabla.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border-2 border-black px-1 py-0.5">
                        <input
                          className="w-full text-xs outline-none bg-transparent"
                          value={row.asignaturaCursada}
                          onChange={(e) => handleTablaChange(i, "asignaturaCursada", e.target.value)}
                          placeholder="Asignatura cursada"
                        />
                      </td>
                      <td className="border-2 border-black px-1 py-0.5">
                        <input
                          className="w-full text-xs text-center outline-none bg-transparent"
                          value={row.uv}
                          onChange={(e) => handleTablaChange(i, "uv", e.target.value)}
                          placeholder="U.V"
                        />
                      </td>
                      <td className="border-2 border-black px-1 py-0.5">
                        <input
                          className="w-full text-xs text-center outline-none bg-transparent"
                          value={row.nota}
                          onChange={(e) => handleTablaChange(i, "nota", e.target.value)}
                          placeholder="Nota"
                        />
                      </td>
                      <td className="border-2 border-black px-1 py-0.5">
                        <input
                          className="w-full text-xs outline-none bg-transparent"
                          value={row.institucion}
                          onChange={(e) => handleTablaChange(i, "institucion", e.target.value)}
                          placeholder="Institución"
                        />
                      </td>
                      <td className="border-2 border-black px-1 py-0.5">
                        <input
                          className="w-full text-xs outline-none bg-transparent"
                          value={row.asignaturaSolicitada}
                          onChange={(e) => handleTablaChange(i, "asignaturaSolicitada", e.target.value)}
                          placeholder="Asignatura solicitada"
                        />
                      </td>
                      <td className="border-2 border-black px-1 py-0.5 text-center">
                        <input
                          type="checkbox"
                          checked={row.ap}
                          onChange={() => handleCheckbox(i, "ap")}
                          className="accent-blue-600"
                        />
                      </td>
                      <td className="border-2 border-black px-1 py-0.5 text-center">
                        <input
                          type="checkbox"
                          checked={row.de}
                          onChange={() => handleCheckbox(i, "de")}
                          className="accent-blue-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-1">AP = Aprobada &nbsp;|&nbsp; DE = Denegada</p>
          </div>

          {/* Texto de solicitud */}
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
            <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
              Texto de solicitud
            </label>
            <textarea
              className="w-full text-base leading-relaxed text-gray-800 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-400 resize-y"
              rows={4}
              value={textoSolicitud}
              onChange={(e) => setTextoSolicitud(e.target.value)}
            />
          </div>

          {/* Sección RESERVADO PARA LA UNIVERSIDAD */}
          <div className="border border-gray-400 rounded p-5 space-y-4">
            <h2 className="font-bold text-center text-sm uppercase tracking-wide">
              Reservado para la Universidad
            </h2>
            <textarea
              className="w-full border-b border-gray-400 outline-none text-sm resize-none bg-transparent"
              rows={4}
              value={notasReservado}
              onChange={(e) => setNotasReservado(e.target.value)}
              placeholder="Notas internas…"
            />
            <div className="flex items-end gap-6 mt-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Nombre del Decano</label>
                <input
                  className="w-full border-b border-gray-500 outline-none text-sm"
                  value={firmaDecano}
                  onChange={(e) => setFirmaDecano(e.target.value)}
                  placeholder="Nombre del decano"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Fecha</label>
                <input
                  type="date"
                  className="w-full border-b border-gray-500 outline-none text-sm"
                  value={fechaDecano}
                  onChange={(e) => setFechaDecano(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sección datos del alumno */}
          <div className="border border-gray-700 bg-gray-800 text-white rounded p-5 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Nombre</label>
              <input
                className="w-full bg-transparent border-b border-gray-500 outline-none text-white text-sm mt-1"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del alumno"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                Carrera(s) Cursada(s)
              </label>
              <input
                className="w-full bg-transparent border-b border-gray-500 outline-none text-white text-sm mt-1"
                value={carrerasCursadas}
                onChange={(e) => setCarrerasCursadas(e.target.value)}
                placeholder="Carrera(s) de origen"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                Carrera que estudia o pretende estudiar
              </label>
              <input
                className="w-full bg-transparent border-b border-gray-500 outline-none text-white text-sm mt-1"
                value={carreraDestino}
                onChange={(e) => setCarreraDestino(e.target.value)}
                placeholder="Carrera destino"
              />
            </div>
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Fecha</label>
                <input
                  type="date"
                  className="w-full bg-transparent border-b border-gray-500 outline-none text-white text-sm mt-1"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-300">Nombre del Alumno</label>
                <input
                  className="w-full bg-transparent border-b border-gray-500 outline-none text-white text-sm mt-1"
                  value={firmaAlumno}
                  onChange={(e) => setFirmaAlumno(e.target.value)}
                  placeholder="Nombre del alumno"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelAction}
              className="px-5 py-2 rounded border border-gray-400 text-gray-700 text-sm hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2 rounded bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
