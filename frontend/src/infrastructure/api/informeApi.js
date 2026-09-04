import { buildApiUrl, requestJson } from "./httpClient.js";

const BASE = "/api/informes";

export function obtenerResumenInformes(filtros = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filtros)) {
    if (value) params.append(key, value);
  }
  return requestJson(`${BASE}/resumen?${params}`);
}

export function obtenerOpcionesInformes() {
  return requestJson(`${BASE}/opciones`);
}

export async function descargarReporteInformesPdf(filtros = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filtros)) {
    if (value) params.append(key, value);
  }

  const token = localStorage.getItem("auth_token");
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(buildApiUrl(`${BASE}/pdf?${params}`), { headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "No se pudo generar el reporte PDF.");
  }

  return response.blob();
}
