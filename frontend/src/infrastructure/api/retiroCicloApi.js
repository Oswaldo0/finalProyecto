import { requestJson } from "./httpClient.js";

const BASE = "/api/retiros-ciclo";

export function listarRetirosCiclo({ page = 1, limit = 20, estado } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (estado) params.append("estado", estado);
  return requestJson(`${BASE}?${params}`);
}

export function obtenerRetiroCiclo(id) {
  return requestJson(`${BASE}/${id}`);
}

export function crearRetiroCiclo(payload) {
  return requestJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function actualizarRetiroCiclo(id, payload) {
  return requestJson(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function eliminarRetiroCiclo(id) {
  return requestJson(`${BASE}/${id}`, { method: "DELETE" });
}
