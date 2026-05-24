import { requestJson } from "./httpClient.js";

const BASE = "/api/equivalencias";

export function listarEquivalencias({ page = 1, limit = 20, estado } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (estado) params.append("estado", estado);
  return requestJson(`${BASE}?${params}`);
}

export function obtenerEquivalencia(id) {
  return requestJson(`${BASE}/${id}`);
}

export function crearEquivalencia(payload) {
  return requestJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}