import { requestJson } from "./httpClient.js";

const BASE = "/api/penalidades";

export function listarPenalidades({ page = 1, limit = 20, estado } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (estado) params.append("estado", estado);
  return requestJson(`${BASE}?${params}`);
}

export function obtenerPenalidad(id) {
  return requestJson(`${BASE}/${id}`);
}

export function crearPenalidad(payload) {
  return requestJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function actualizarPenalidad(id, payload) {
  return requestJson(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function eliminarPenalidad(id) {
  return requestJson(`${BASE}/${id}`, { method: "DELETE" });
}

export function urlPdfPenalidad(id) {
  return `${BASE}/${id}/pdf`;
}

export function buscarEstudiantes(q = "") {
  return requestJson(`/api/estudiantes/buscar?q=${encodeURIComponent(q)}`);
}

export function listarCarreras() {
  return requestJson("/api/carreras");
}
