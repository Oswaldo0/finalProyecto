import { loginUsuario, obtenerSesionActual } from "../../infrastructure/api/authApi.js";

export async function iniciarSesion(credentials) {
  const session = await loginUsuario(credentials);
  localStorage.setItem("auth_token", session.token);
  localStorage.setItem("auth_user", JSON.stringify(session.user));
  return session;
}

export async function cargarSesionActual() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const user = await obtenerSesionActual();
  localStorage.setItem("auth_user", JSON.stringify(user));
  return user;
}

export function obtenerUsuarioGuardado() {
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}
