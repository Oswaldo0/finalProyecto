const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function buildApiUrl(url) {
  if (!API_BASE_URL || /^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url}`;
}

export async function requestJson(url, options = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = new Headers(options.headers ?? {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(url), {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }

  if (!response.ok) {
    throw new Error(data.message || "Error de comunicación con el servidor.");
  }

  return data;
}
