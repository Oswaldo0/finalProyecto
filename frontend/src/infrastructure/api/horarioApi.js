import { requestJson } from "./httpClient.js";

export function fetchHorarioFormOptions() {
  return requestJson("/api/horarios/form-options");
}

export function createHorario(payload) {
  return requestJson("/api/horarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function fetchHorarios() {
  return requestJson("/api/horarios");
}
