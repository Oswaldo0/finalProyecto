import { requestJson } from "./httpClient.js";

export function fetchStudents(limit = 25) {
  return requestJson(`/api/estudiantes?limit=${limit}`);
}

export function fetchStudentFormOptions() {
  return requestJson("/api/estudiantes/form-options");
}

export function fetchEditableStudent(expediente) {
  return requestJson(`/api/estudiantes/${encodeURIComponent(expediente)}/edicion`);
}

export function createStudent(payload) {
  return requestJson("/api/estudiantes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateStudent(expediente, payload) {
  return requestJson(`/api/estudiantes/${encodeURIComponent(expediente)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteStudent(expediente) {
  return requestJson(`/api/estudiantes/${encodeURIComponent(expediente)}`, {
    method: "DELETE",
  });
}
