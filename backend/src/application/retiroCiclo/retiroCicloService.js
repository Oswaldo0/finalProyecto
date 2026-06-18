import * as repo from "../../infrastructure/repositories/retiroCicloRepository.js";
import {
  assertNonNegativeDecimal,
  assertValidDate,
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
  validarCampos(retiro);
  validarAsignaturas(asignaturas);
  return repo.create({ retiro, asignaturas });
}

export async function actualizar(id, body) {
  await obtener(id);
  const { retiro, asignaturas } = body;
  validarCampos(retiro);
  validarAsignaturas(asignaturas);
  return repo.update(id, { retiro, asignaturas });
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
}

function validarAsignaturas(asignaturas = []) {
  requireNonEmptyArray(asignaturas, "asignaturas");
  asignaturas.forEach((asignatura, index) => {
    requireObject(asignatura, `asignaturas[${index}]`);
    requireFields(asignatura, ["asignatura_nombre"]);
    assertNonNegativeDecimal(asignatura.uv, `asignaturas[${index}].uv`);
  });
}
