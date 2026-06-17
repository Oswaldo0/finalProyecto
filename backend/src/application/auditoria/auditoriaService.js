import * as repo from "../../infrastructure/repositories/auditoriaRepository.js";

export function listar(filtros) {
  return repo.findAll(filtros);
}
