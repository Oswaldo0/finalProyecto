import * as repo from "../../infrastructure/repositories/retiroCicloRepository.js";

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
  return repo.create({ retiro, asignaturas });
}

export async function actualizar(id, body) {
  await obtener(id);
  const { retiro, asignaturas } = body;
  validarCampos(retiro);
  return repo.update(id, { retiro, asignaturas });
}

export async function eliminar(id) {
  await obtener(id);
  return repo.remove(id);
}

function validarCampos(retiro) {
  const required = [
    "expediente", "carnet", "fecha",
    "alumno_nombre", "carrera_nombre",
    "ciclo_a_retirar", "texto_resolucion",
    "decano_nombre", "facultad_nombre",
  ];
  for (const field of required) {
    if (!retiro[field] || String(retiro[field]).trim() === "") {
      const err = new Error(`El campo '${field}' es obligatorio.`);
      err.status = 400;
      throw err;
    }
  }
}
