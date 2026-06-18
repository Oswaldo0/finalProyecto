import * as repo from "../../infrastructure/repositories/equivalenciaRepository.js";
import {
  assertAllowedValue,
  assertNonNegativeDecimal,
  assertValidDate,
  requireFields,
  requireNonEmptyArray,
  requireObject,
} from "../shared/validation.js";

const ESTADOS_EQUIVALENCIA = ["BORRADOR", "REVISION", "APROBADA", "DENEGADA"];
const RESULTADOS_DETALLE = ["PENDIENTE", "APROBADA", "DENEGADA"];

export async function listar(filtros) {
  return repo.findAll(filtros);
}

export async function obtener(id) {
  const equivalencia = await repo.findById(id);
  if (!equivalencia) {
    const err = new Error("Equivalencia no encontrada.");
    err.status = 404;
    throw err;
  }
  return equivalencia;
}

export async function crear(body) {
  const { equivalencia, detalles } = body;
  validarEquivalencia(equivalencia);
  validarDetalles(detalles);
  return repo.create({ equivalencia, detalles });
}

export async function actualizar(id, body) {
  await obtener(id);
  const { equivalencia, detalles } = body;
  validarEquivalencia(equivalencia);
  if (detalles !== undefined) validarDetalles(detalles);
  return repo.update(id, { equivalencia, detalles });
}

export async function eliminar(id) {
  await obtener(id);
  return repo.remove(id);
}

function validarEquivalencia(equivalencia = {}) {
  requireObject(equivalencia, "equivalencia");
  requireFields(equivalencia, ["alumno_nombre", "texto_solicitud"]);
  assertValidDate(equivalencia.fecha_solicitud, "fecha_solicitud");
  assertValidDate(equivalencia.fecha_decano, "fecha_decano");
  assertAllowedValue(equivalencia.estado ?? "BORRADOR", ESTADOS_EQUIVALENCIA, "estado");
}

function validarDetalles(detalles = []) {
  requireNonEmptyArray(detalles, "detalles");

  detalles.forEach((detalle, index) => {
    requireObject(detalle, `detalles[${index}]`);
    requireFields(detalle, ["asignatura_cursada", "asignatura_solicitada"]);
    assertNonNegativeDecimal(detalle.uv, `detalles[${index}].uv`);
    assertNonNegativeDecimal(detalle.nota, `detalles[${index}].nota`);
    assertAllowedValue(
      detalle.resultado ?? "PENDIENTE",
      RESULTADOS_DETALLE,
      `detalles[${index}].resultado`,
    );
  });
}
