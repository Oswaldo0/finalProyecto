import { requestJson } from "./httpClient.js";

const BASE = "/api/absorciones";

export function listarAbsorciones({ page = 1, limit = 20, estado } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (estado) params.append("estado", estado);
  return requestJson(`${BASE}?${params}`);
}

export function obtenerAbsorcion(id) {
  return requestJson(`${BASE}/${id}`);
}

export function crearAbsorcion(payload) {
  return requestJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function actualizarAbsorcion(id, payload) {
  return requestJson(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function eliminarAbsorcion(id) {
  return requestJson(`${BASE}/${id}`, { method: "DELETE" });
}

export function urlPdfAbsorcion(id) {
  return `${BASE}/${id}/pdf`;
}
