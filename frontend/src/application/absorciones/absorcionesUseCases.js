import {
  listarAbsorciones,
  obtenerAbsorcion,
  crearAbsorcion as apiCrear,
  actualizarAbsorcion as apiActualizar,
  eliminarAbsorcion as apiEliminar,
  urlPdfAbsorcion,
} from "../../infrastructure/api/absorcionApi.js";

export { listarAbsorciones, obtenerAbsorcion, urlPdfAbsorcion };

export function crearAbsorcion(payload) {
  return apiCrear(payload);
}

export function modificarAbsorcion(id, payload) {
  return apiActualizar(id, payload);
}

export function eliminarAbsorcion(id) {
  return apiEliminar(id);
}
