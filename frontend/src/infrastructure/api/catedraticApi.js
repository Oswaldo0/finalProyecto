import { requestJson } from "./httpClient.js";

export function fetchCatedraticFormOptions() {
  return requestJson("/api/catedraticos/form-options");
}

export function createCatedratic(payload) {
  return requestJson("/api/catedraticos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function fetchCatedraticos(limit = 50) {
  return requestJson(`/api/catedraticos?limit=${limit}`);
}
