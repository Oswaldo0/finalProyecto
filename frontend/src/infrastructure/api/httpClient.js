export async function requestJson(url, options = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = new Headers(options.headers ?? {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
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
