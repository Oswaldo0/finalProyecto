import { requestJson } from "./httpClient.js";

const BASE = "/api/auth";

export function loginUsuario(credentials) {
  return requestJson(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}

export function obtenerSesionActual() {
  return requestJson(`${BASE}/me`);
}
