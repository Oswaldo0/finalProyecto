import {
  actualizarEquivalencia as apiActualizar,
  crearEquivalencia as apiCrear,
  eliminarEquivalencia as apiEliminar,
  listarEquivalencias,
  obtenerEquivalencia,
} from "../../infrastructure/api/equivalenciaApi.js";

export { listarEquivalencias, obtenerEquivalencia };

export function crearEquivalencia(payload) {
  return apiCrear(payload);
}

export function modificarEquivalencia(id, payload) {
  return apiActualizar(id, payload);
}

export function eliminarEquivalencia(id) {
  return apiEliminar(id);
}
