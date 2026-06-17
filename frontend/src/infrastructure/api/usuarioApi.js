import { requestJson } from "./httpClient.js";

const BASE = "/api/usuarios";

export function listarUsuarios({ page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams({ page, limit });
  return requestJson(`${BASE}?${params}`);
}

export function crearUsuario(payload) {
  return requestJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function listarAuditoria({ page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page, limit });
  return requestJson(`${BASE}/auditoria?${params}`);
}
