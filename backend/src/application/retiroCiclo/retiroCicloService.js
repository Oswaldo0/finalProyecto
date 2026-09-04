import * as repo from "../../infrastructure/repositories/retiroCicloRepository.js";
import {
  assertAcademicCycle,
  assertNonNegativeDecimal,
  assertValidDate,
  normalizeAcademicUv,
  requireFields,
  requireNonEmptyArray,
  requireObject,
} from "../shared/validation.js";

export async function listar(filtros) {
  return repo.findAll(filtros);
}

export async function obtener(id) {
  const retiro = await repo.findById(id);
  if (!retiro) {
    const err = new Error("Retiro de ciclo no encontrado.");
    err.status = 404;
    throw err;
  }
  return retiro;
}

export async function crear(body) {
  const { retiro, asignaturas } = body;
  const asignaturasNormalizadas = normalizarAsignaturas(asignaturas);
  validarCampos(retiro);
  validarAsignaturas(asignaturasNormalizadas);
  return repo.create({ retiro, asignaturas: asignaturasNormalizadas });
}

export async function actualizar(id, body) {
  await obtener(id);
  const { retiro, asignaturas } = body;
  const asignaturasNormalizadas = normalizarAsignaturas(asignaturas);
  validarCampos(retiro);
  validarAsignaturas(asignaturasNormalizadas);
  return repo.update(id, { retiro, asignaturas: asignaturasNormalizadas });
}

export async function marcarImpresa(id) {
  await obtener(id);
  return repo.markAsPrinted(id);
}

export async function eliminar(id) {
  await obtener(id);
  return repo.remove(id);
}

function validarCampos(retiro) {
  requireObject(retiro, "retiro");
  const required = [
    "expediente", "carnet", "fecha",
    "alumno_nombre", "carrera_nombre",
    "ciclo_a_retirar", "texto_resolucion",
    "decano_nombre", "facultad_nombre",
  ];
  requireFields(retiro, required);
  assertValidDate(retiro.fecha, "fecha", { required: true });
  assertAcademicCycle(retiro.ciclo_a_retirar, "ciclo_a_retirar");
}

function validarAsignaturas(asignaturas = []) {
  requireNonEmptyArray(asignaturas, "asignaturas");
  asignaturas.forEach((asignatura, index) => {
    requireObject(asignatura, `asignaturas[${index}]`);
    requireFields(asignatura, ["asignatura_nombre"]);
    assertNonNegativeDecimal(asignatura.uv, `asignaturas[${index}].uv`);
  });
}

function normalizarAsignaturas(asignaturas = []) {
  return asignaturas.map((asignatura) => ({
    ...asignatura,
    uv: normalizeAcademicUv(asignatura),
  }));
}
