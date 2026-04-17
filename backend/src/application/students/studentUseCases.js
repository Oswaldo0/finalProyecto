import { normalizeStudentPayload } from "../../domain/student/studentModel.js";
import {
  createStudent,
  deleteStudentByExpediente,
  getEditableStudentByExpediente,
  getStudentByExpediente,
  getStudentFormOptions,
  getStudentsWithSchema,
  updateStudent,
} from "../../infrastructure/repositories/studentRepository.js";
import { buildStudentReportPdf } from "../reports/studentReportPdf.js";

export function listStudents(limit) {
  return getStudentsWithSchema(limit);
}

export function getStudentOptions() {
  return getStudentFormOptions();
}

export function getEditableStudent(expediente) {
  return getEditableStudentByExpediente(expediente);
}

export function createStudentUseCase(payload) {
  return createStudent(normalizeStudentPayload(payload));
}

export function updateStudentUseCase(expediente, payload) {
  return updateStudent(expediente, normalizeStudentPayload(payload));
}

export function deleteStudentUseCase(expediente) {
  return deleteStudentByExpediente(expediente);
}

export async function buildStudentReportUseCase(expediente) {
  const student = await getStudentByExpediente(expediente);
  if (!student) return null;
  const pdf = buildStudentReportPdf(student);
  return { student, pdf };
}
