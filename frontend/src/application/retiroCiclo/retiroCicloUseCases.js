import {
  crearRetiroCiclo as apiCrear,
  actualizarRetiroCiclo as apiActualizar,
  listarRetirosCiclo,
  obtenerRetiroCiclo,
  eliminarRetiroCiclo,
} from "../../infrastructure/api/retiroCicloApi.js";

export { listarRetirosCiclo, obtenerRetiroCiclo, eliminarRetiroCiclo };

export function crearRetiro(payload) {
  return apiCrear(payload);
}

export function modificarRetiro(id, payload) {
  return apiActualizar(id, payload);
}

