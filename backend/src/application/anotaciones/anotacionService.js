import * as repo from "../../infrastructure/repositories/anotacionRepository.js";
import {
  assertAcademicCycle,
  assertAllowedValue,
  assertValidDate,
  requireFields,
  requireObject,
  validationError,
} from "../shared/validation.js";

const ESTADOS_ANOTACION = ["CREADO", "EMITIDA", "IMPRESO", "ANULADA"];
const TIPOS_CATALOGO = ["observadores", "facultades", "horarios"];

export function listar(filtros) {
  return repo.findAll(filtros);
}

export async function obtener(id) {
  const anotacion = await repo.findById(id);
  if (!anotacion) {
    const err = new Error("Anotación no encontrada.");
    err.status = 404;
    throw err;
  }
  return anotacion;
}

export function obtenerCatalogos() {
  return repo.findCatalogos();
}

export function guardarCatalogos(catalogos) {
  validarCatalogos(catalogos);
  return repo.replaceCatalogos(normalizarCatalogos(catalogos));
}

export function crear(body = {}, user = null) {
  validarAnotacion(body);
  return repo.create({ ...body, usuario_id: user?.id ?? null });
}

export async function actualizar(id, body = {}) {
  await obtener(id);
  validarAnotacion(body);
  return repo.update(id, body);
}

export async function marcarImpresa(id) {
  await obtener(id);
  return repo.markAsPrinted(id);
}

export async function eliminar(id) {
  await obtener(id);
  return repo.remove(id);
}

function validarAnotacion(anotacion = {}) {
  requireObject(anotacion, "anotacion");
  requireFields(anotacion, [
    "observador",
    "fecha",
    "hora_inicio",
    "hora_fin",
    "asignatura_grupo",
    "facultad",
    "horario",
    "docente",
    "aula",
    "ciclo",
    "observaciones",
  ]);
  assertValidDate(anotacion.fecha, "fecha", { required: true });
  assertAcademicCycle(anotacion.ciclo, "ciclo");
  assertAllowedValue(anotacion.estado ?? "CREADO", ESTADOS_ANOTACION, "estado");
}

function validarCatalogos(catalogos = {}) {
  requireObject(catalogos, "catalogos");

  TIPOS_CATALOGO.forEach((tipo) => {
    if (!Array.isArray(catalogos[tipo])) {
      throw validationError(`El catálogo '${tipo}' debe ser una lista.`);
    }
  });
}

function normalizarCatalogos(catalogos) {
  return TIPOS_CATALOGO.reduce((acc, tipo) => {
    acc[tipo] = [...new Set(catalogos[tipo].map((valor) => String(valor).trim()).filter(Boolean))];
    return acc;
  }, {});
}
