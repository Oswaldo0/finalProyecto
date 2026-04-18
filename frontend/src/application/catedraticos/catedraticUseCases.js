import {
  createCatedratic,
  fetchCatedraticFormOptions,
  fetchCatedraticos,
} from "../../infrastructure/api/catedraticApi.js";

export function getCatedraticFormOptions() {
  return fetchCatedraticFormOptions();
}

export function createCatedraticUseCase(payload) {
  return createCatedratic(payload);
}

export function listCatedraticos(limit) {
  return fetchCatedraticos(limit);
}
