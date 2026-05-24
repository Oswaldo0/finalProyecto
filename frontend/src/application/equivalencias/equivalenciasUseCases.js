import {
  crearEquivalencia as apiCrear,
  listarEquivalencias,
  obtenerEquivalencia,
} from "../../infrastructure/api/equivalenciaApi.js";

export { listarEquivalencias, obtenerEquivalencia };

export function crearEquivalencia(payload) {
  return apiCrear(payload);
}

export function modificarEquivalencia(payload) {
  return Promise.resolve(payload);
}

export function imprimirEquivalencia(payload) {
  return Promise.resolve(payload);
}
