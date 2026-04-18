import {
  createHorario,
  fetchHorarioFormOptions,
  fetchHorarios,
} from "../../infrastructure/api/horarioApi.js";

export function getHorarioFormOptions() {
  return fetchHorarioFormOptions();
}

export function createHorarioUseCase(payload) {
  return createHorario(payload);
}

export function listHorarios() {
  return fetchHorarios();
}
