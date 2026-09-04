import * as repo from "../../infrastructure/repositories/consultaRepository.js";
import {
  assertAcademicCycle,
  assertAllowedValue,
  assertValidDate,
  requireFields,
  requireObject,
} from "../shared/validation.js";

const ESTADOS_CONSULTA = ["CREADO", "IMPRESO", "ANULADA"];

export function listar(filtros) {
  return repo.findAll(filtros);
}

export async function obtener(id) {
  const consulta = await repo.findById(id);
  if (!consulta) {
    const err = new Error("Consulta no encontrada.");
    err.status = 404;
    throw err;
  }
  return consulta;
}

export function crear(body = {}, user = null) {
  validarConsulta(body);
  return repo.create({ ...normalizarConsulta(body), usuario_id: user?.id ?? null });
}

export async function actualizar(id, body = {}) {
  await obtener(id);
  validarConsulta(body);
  return repo.update(id, normalizarConsulta(body));
}

export async function marcarImpresa(id) {
  await obtener(id);
  return repo.markAsPrinted(id);
}

export async function eliminar(id) {
  await obtener(id);
  return repo.remove(id);
}

function validarConsulta(consulta = {}) {
  requireObject(consulta, "consulta");
  requireFields(consulta, [
    "tipo_consulta",
    "coordinador_nombres",
    "coordinador_apellidos",
    "alumno_nombres",
    "alumno_apellidos",
    "fecha_consulta",
    "ciclo",
    "carrera_nombre",
    "materia_nombre",
    "consulta",
    "respuesta",
  ]);
  assertValidDate(consulta.fecha_consulta, "fecha_consulta", { required: true });
  assertAcademicCycle(consulta.ciclo, "ciclo");
  assertAllowedValue(consulta.estado ?? "CREADO", ESTADOS_CONSULTA, "estado");
}

function normalizarConsulta(consulta) {
  return {
    ...consulta,
    materia_nombre: consulta.materia_nombre?.trim() || "SIN ASIGNAR",
    estado: consulta.estado ?? "CREADO",
  };
}
