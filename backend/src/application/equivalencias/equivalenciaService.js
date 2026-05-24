import * as repo from "../../infrastructure/repositories/equivalenciaRepository.js";

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
  validarCampos(equivalencia);
  return repo.create({ equivalencia, detalles });
}

function validarCampos(equivalencia = {}) {
  const required = ["alumno_nombre", "texto_solicitud"];
  for (const field of required) {
    if (!equivalencia[field] || String(equivalencia[field]).trim() === "") {
      const err = new Error(`El campo '${field}' es obligatorio.`);
      err.status = 400;
      throw err;
    }
  }
}