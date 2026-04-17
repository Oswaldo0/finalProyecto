import {
  createStudent,
  deleteStudent,
  fetchEditableStudent,
  fetchStudentFormOptions,
  fetchStudents,
  updateStudent,
} from "../../infrastructure/api/studentApi.js";

export function listStudents(limit = 25) {
  return fetchStudents(limit);
}

export function getStudentFormOptions() {
  return fetchStudentFormOptions();
}

export function getEditableStudent(expediente) {
  return fetchEditableStudent(expediente);
}

export function createStudentUseCase(payload) {
  return createStudent(payload);
}

export function updateStudentUseCase(expediente, payload) {
  return updateStudent(expediente, payload);
}

export function deleteStudentUseCase(expediente) {
  return deleteStudent(expediente);
}
