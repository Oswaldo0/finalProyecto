import * as repo from "../../infrastructure/repositories/usuarioRepository.js";
import { hashPassword } from "../../infrastructure/security/passwordHash.js";

const VALID_ROLES = new Set(["ADMIN", "DECANO", "SECRETARIO", "OPERADOR", "CONSULTA"]);
const VALID_ESTADOS = new Set(["ACTIVO", "BLOQUEADO"]);

export function listar(filtros) {
  return repo.findAll(filtros);
}

export async function crear(body = {}) {
  validarUsuario(body, { requirePassword: true });

  const existing = await repo.findByUsername(body.username);
  if (existing) {
    const err = new Error("Ya existe un usuario con ese nombre de usuario.");
    err.status = 409;
    throw err;
  }

  const password_hash = await hashPassword(body.password);
  return repo.create({
    nombre: body.nombre.trim(),
    username: body.username.trim(),
    email: body.email?.trim() || null,
    password_hash,
    rol: body.rol ?? "OPERADOR",
    estado: body.estado ?? "ACTIVO",
  });
}

export async function actualizar(id, body = {}) {
  const usuario = await obtener(id);
  validarUsuario({ ...body, username: usuario.username }, { requirePassword: false });

  return repo.update(id, {
    nombre: body.nombre.trim(),
    email: body.email?.trim() || null,
    rol: body.rol,
    estado: body.estado,
  });
}

export async function cambiarPassword(id, body = {}) {
  await obtener(id);
  validarPassword(body.password);

  const password_hash = await hashPassword(body.password);
  await repo.updatePassword(id, password_hash);
  return { message: "Contraseña actualizada." };
}

export async function obtener(id) {
  const usuario = await repo.findById(id);
  if (!usuario) {
    const err = new Error("Usuario no encontrado.");
    err.status = 404;
    throw err;
  }
  return usuario;
}

function validarUsuario(usuario, { requirePassword }) {
  const required = ["nombre", "username", "rol", "estado"];
  const missing = required.filter((field) => !usuario[field] || String(usuario[field]).trim() === "");
  if (missing.length > 0) {
    const err = new Error(`Campos requeridos: ${missing.join(", ")}`);
    err.status = 422;
    throw err;
  }

  if (!VALID_ROLES.has(usuario.rol)) {
    const err = new Error("Rol inválido.");
    err.status = 422;
    throw err;
  }

  if (!VALID_ESTADOS.has(usuario.estado)) {
    const err = new Error("Estado inválido.");
    err.status = 422;
    throw err;
  }

  if (requirePassword) validarPassword(usuario.password);
}

function validarPassword(password) {
  if (!password || String(password).length < 10) {
    const err = new Error("La contraseña debe tener al menos 10 caracteres.");
    err.status = 422;
    throw err;
  }
}
