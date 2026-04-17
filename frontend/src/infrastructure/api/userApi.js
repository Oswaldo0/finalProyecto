import { requestJson } from "./httpClient.js";

export function fetchUserFormOptions() {
  return requestJson("/api/usuarios/form-options");
}

export function fetchUsers(limit = 25) {
  return requestJson(`/api/usuarios?limit=${limit}`);
}

export function createUser(payload) {
  return requestJson("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
