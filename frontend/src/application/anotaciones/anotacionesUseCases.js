import {
  actualizarAnotacion as apiActualizar,
  crearAnotacion as apiCrear,
  guardarCatalogosAnotaciones as apiGuardarCatalogos,
  listarAnotaciones as apiListar,
  marcarAnotacionImpresa as apiMarcarImpresa,
  obtenerAnotacion as apiObtener,
  obtenerCatalogosAnotaciones as apiObtenerCatalogos,
} from "../../infrastructure/api/anotacionApi.js";

export const CATALOGOS_INICIALES = {
  observadores: [
    "ING. MARILYN JACQUELINE HERNANDEZ",
    "MTRA. ANA MARÍA ZELIDÓN DE LEMUS",
    "LIC. JOSÉ FRANCISCO PATIÑO NOYOLA",
    "ING. MANUEL DE JESÚS URRUTIA",
    "ING. OSWALDO ENRIQUE LARÍN",
    "ING. JOSÉ ADOLFO PACAS TORRES",
    "MTRO. MARIO JOSÉ CRUZ PAYÉS",
    "MTRO. ÁNGEL ERNESTO MONGE LARA",
  ],
  facultades: [
    "FACULTAD DE CIENCIAS JURIDICAS",
    "FACULTAD DE INGENIERIA Y CIENCIAS NATURALES",
    "FACULTAD DE ECONOMIA Y CIENCIAS SOCIALES",
    "ESCUELA DE EDUCACIÓN",
    "FACULTAD DE CIENCIAS DE LA SALUD",
  ],
  horarios: [
    "7:00 a.m. - 8:30 a.m.",
    "8:30 a.m. - 10:00 a.m.",
    "10:00 a.m. - 11:30 a.m.",
    "1:00 p.m. - 2:30 p.m.",
    "2:30 p.m. - 4:00 p.m.",
    "5:30 p.m. - 7:00 p.m.",
  ],
};

export async function obtenerCatalogosAnotaciones() {
  try {
    const catalogos = await apiObtenerCatalogos();
    return mergeCatalogos(catalogos);
  } catch {
    return CATALOGOS_INICIALES;
  }
}

export async function guardarCatalogosAnotaciones(catalogos) {
  const normalizados = mergeCatalogos(catalogos);
  try {
    return mergeCatalogos(await apiGuardarCatalogos(normalizados));
  } catch {
    return normalizados;
  }
}

export async function listarAnotaciones() {
  const result = await apiListar({ page: 1, limit: 100 });
  return (result.data ?? []).map(fromApi);
}

export async function obtenerAnotacion(id) {
  return fromApi(await apiObtener(id));
}

export function crearAnotacion(payload) {
  return apiCrear(toApi(payload));
}

export function modificarAnotacion(id, payload) {
  return apiActualizar(id, toApi(payload));
}

export function imprimirAnotacion(payload) {
  return Promise.resolve(payload);
}

export function marcarAnotacionImpresa(id) {
  return apiMarcarImpresa(id).then(fromApi);
}

function mergeCatalogos(catalogos = {}) {
  return {
    observadores: catalogos.observadores?.length ? catalogos.observadores : CATALOGOS_INICIALES.observadores,
    facultades: catalogos.facultades?.length ? catalogos.facultades : CATALOGOS_INICIALES.facultades,
    horarios: catalogos.horarios?.length ? catalogos.horarios : CATALOGOS_INICIALES.horarios,
  };
}

function toApi(payload) {
  return {
    observador: payload.observador,
    fecha: payload.fecha,
    hora_inicio: payload.horaInicio,
    hora_fin: payload.horaFin,
    asignatura_grupo: payload.asignaturaGrupo,
    facultad: payload.facultad,
    horario: payload.horario,
    docente: payload.docente,
    aula: payload.aula,
    ciclo: payload.ciclo,
    observaciones: payload.observaciones,
    estado: payload.estado ?? "CREADO",
  };
}

function fromApi(row) {
  return {
    id: row.id,
    correlativo: row.correlativo,
    observador: row.observador,
    fecha: row.fecha,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    asignaturaGrupo: row.asignatura_grupo,
    facultad: row.facultad,
    horario: row.horario,
    docente: row.docente,
    aula: row.aula,
    ciclo: row.ciclo,
    observaciones: row.observaciones,
    estado: row.estado,
    createdAt: row.created_at,
  };
}
