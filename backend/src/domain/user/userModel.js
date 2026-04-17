export function normalizeUserPayload(payload = {}) {
  return {
    username: payload.username,
    password: payload.password,
    nombre: payload.nombre,
    apellido: payload.apellido,
    correo: payload.correo,
    telefono: payload.telefono,
    direccion: payload.direccion,
    id_departamento: payload.id_departamento,
    id_municipio: payload.id_municipio,
  };
}
