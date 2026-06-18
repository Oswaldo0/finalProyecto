import { requestJson } from "./httpClient.js";

const BASE = "/api/anotaciones";

export function listarAnotaciones({ page = 1, limit = 20, estado } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (estado) params.append("estado", estado);
  return requestJson(`${BASE}?${params}`);
}

export function obtenerAnotacion(id) {
  return requestJson(`${BASE}/${id}`);
}

export function crearAnotacion(payload) {
  return requestJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function actualizarAnotacion(id, payload) {
  return requestJson(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function obtenerCatalogosAnotaciones() {
  return requestJson(`${BASE}/catalogos`);
}

export function guardarCatalogosAnotaciones(payload) {
  return requestJson(`${BASE}/catalogos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
