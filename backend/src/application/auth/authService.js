import * as usuarios from "../../infrastructure/repositories/usuarioRepository.js";
import { createToken } from "../../infrastructure/security/jwt.js";
import { verifyPassword } from "../../infrastructure/security/passwordHash.js";

const TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 8;

export async function login({ username, password }) {
  if (!username || !password) {
    const err = new Error("Usuario y contraseña son obligatorios.");
    err.status = 400;
    throw err;
  }

  const usuario = await usuarios.findByUsername(String(username).trim());
  const isValidPassword = usuario
    ? await verifyPassword(String(password), usuario.password_hash)
    : false;

  if (!usuario || !isValidPassword) {
    const err = new Error("Credenciales inválidas.");
    err.status = 401;
    throw err;
  }

  if (usuario.estado !== "ACTIVO") {
    const err = new Error("El usuario no está activo.");
    err.status = 403;
    throw err;
  }

  await usuarios.updateUltimoLogin(usuario.id);

  const publicUser = usuarios.toPublicUser(usuario);
  const token = createToken(
    {
      sub: String(usuario.id),
      username: usuario.username,
      rol: usuario.rol,
    },
    { expiresInSeconds: TOKEN_EXPIRES_IN_SECONDS },
  );

  return {
    token,
    token_type: "Bearer",
    expires_in: TOKEN_EXPIRES_IN_SECONDS,
    user: publicUser,
  };
}

export async function me(userId) {
  const usuario = await usuarios.findById(userId);
  if (!usuario) {
    const err = new Error("Usuario no encontrado.");
    err.status = 404;
    throw err;
  }

  return usuarios.toPublicUser(usuario);
}
