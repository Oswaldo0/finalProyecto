import {
  createCatedratic,
  getCatedraticFormOptions,
  getCatedraticosWithSchema,
} from "../../infrastructure/repositories/catedraticRepository.js";

export function listCatedraticos(limit) {
  return getCatedraticosWithSchema(limit);
}

export function getCatedraticOptions() {
  return getCatedraticFormOptions();
}

export function createCatedraticUseCase(payload) {
  return createCatedratic(payload);
}
