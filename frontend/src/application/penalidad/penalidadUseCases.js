import {
  crearPenalidad as apiCrear,
  actualizarPenalidad as apiActualizar,
  urlPdfPenalidad,
  listarPenalidades,
  obtenerPenalidad,
  eliminarPenalidad,
  buscarEstudiantes,
  listarCarreras,
} from "../../infrastructure/api/penalidadApi.js";

export { listarPenalidades, obtenerPenalidad, eliminarPenalidad, buscarEstudiantes, listarCarreras };

export function crearPenalidad(payload) {
  return apiCrear(payload);
}

export function modificarPenalidad(id, payload) {
  return apiActualizar(id, payload);
}

export function imprimirPenalidad(id) {
  window.open(urlPdfPenalidad(id), "_blank");
}
