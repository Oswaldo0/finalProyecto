import {
  actualizarConsulta as apiActualizar,
  crearConsulta as apiCrear,
  listarConsultas as apiListar,
  marcarConsultaImpresa as apiMarcarImpresa,
  obtenerConsulta as apiObtener,
} from "../../infrastructure/api/consultaApi.js";

export async function listarConsultas(options = {}) {
  const result = await apiListar({ page: 1, limit: 100, ...options });
  return (result.data ?? []).map(fromApi);
}

export async function obtenerConsulta(id) {
  return fromApi(await apiObtener(id));
}

export function crearConsulta(payload) {
  return apiCrear(toApi(payload)).then(fromApi);
}

export function modificarConsulta(id, payload) {
  return apiActualizar(id, toApi(payload)).then(fromApi);
}

export function marcarConsultaImpresa(id) {
  return apiMarcarImpresa(id).then(fromApi);
}

function toApi(payload) {
  return {
    tipo_consulta: payload.tipoConsulta,
    coordinador_nombres: payload.coordinadorNombres,
    coordinador_apellidos: payload.coordinadorApellidos,
    alumno_nombres: payload.alumnoNombres,
    alumno_apellidos: payload.alumnoApellidos,
    fecha_consulta: payload.fechaConsulta,
    ciclo: payload.ciclo,
    carrera_nombre: payload.carrera,
    materia_nombre: payload.materia || "SIN ASIGNAR",
    consulta: payload.consulta,
    respuesta: payload.respuesta,
    estado: payload.estado ?? "CREADO",
  };
}

function fromApi(row) {
  if (!row) return null;
  return {
    id: row.id,
    correlativo: row.correlativo,
    tipoConsulta: row.tipo_consulta,
    coordinadorNombres: row.coordinador_nombres,
    coordinadorApellidos: row.coordinador_apellidos,
    alumnoNombres: row.alumno_nombres,
    alumnoApellidos: row.alumno_apellidos,
    fechaConsulta: row.fecha_consulta,
    ciclo: row.ciclo,
    carrera: row.carrera_nombre,
    materia: row.materia_nombre,
    consulta: row.consulta,
    respuesta: row.respuesta,
    estado: row.estado,
    createdAt: row.created_at,
  };
}
