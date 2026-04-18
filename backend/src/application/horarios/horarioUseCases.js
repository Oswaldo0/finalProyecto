import {
  createHorario,
  getHorarioFormOptions,
  getHorariosWithDetail,
} from "../../infrastructure/repositories/horarioRepository.js";

export function getHorarioFormOptionsUseCase() {
  return getHorarioFormOptions();
}

export function createHorarioUseCase(payload) {
  return createHorario(payload);
}

export function listHorariosUseCase() {
  return getHorariosWithDetail();
}
