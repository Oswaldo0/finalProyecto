export function normalizeStudentPayload(payload = {}) {
  return {
    expediente: payload.expediente,
    nombre: payload.nombre,
    apellido: payload.apellido,
    cum: payload.cum,
    calidad: payload.calidad,
    year_ingreso: payload.year_ingreso,
    id_plan_estu: payload.id_plan_estu,
    telefono: payload.telefono,
    correo: payload.correo,
    direccion: payload.direccion,
    id_departamento: payload.id_departamento,
    id_municipio: payload.id_municipio,
  };
}
