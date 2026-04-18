import { requestJson } from "./httpClient.js";

export function fetchGroupFormOptions() {
  return requestJson("/api/grupos/opciones-formulario");
}

export function createGroup(groupData) {
  return requestJson("/api/grupos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(groupData),
  });
}

export function fetchGroupsList() {
  return requestJson("/api/grupos");
}
