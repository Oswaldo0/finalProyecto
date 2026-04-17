import { useEffect, useMemo, useState } from "react";
import {
  createUserUseCase,
  getUserFormOptions,
  listUsers,
} from "../../application/users/userUseCases.js";

const EMPTY_FORM = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  username: "",
  password: "",
  direccion: "",
  id_departamento: "",
  id_municipio: "",
};

export function UserPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [options, setOptions] = useState({ departamentos: [], municipios: [] });

  // Carga opciones al montar el componente
  useEffect(() => {
    getUserFormOptions()
      .then((data) => setOptions(data))
      .catch(() => {});
  }, []);

  // Municipios filtrados según el departamento seleccionado
  const filteredMunicipios = useMemo(() => {
    if (!form.id_departamento) return [];
    return options.municipios.filter(
      (m) => String(m.id_departamento) === String(form.id_departamento),
    );
  }, [form.id_departamento, options.municipios]);

  function handleChange(e) {
    const { name, value } = e.target;
    // Al cambiar departamento, resetear municipio
    if (name === "id_departamento") {
      setForm((prev) => ({ ...prev, id_departamento: value, id_municipio: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);
    setSaving(true);

    try {
      const data = await createUserUseCase({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        username: form.username.trim(),
        password: form.password,
        direccion: form.direccion.trim() || undefined,
        id_departamento: form.id_departamento || undefined,
        id_municipio: form.id_municipio || undefined,
      });

      setFeedback({
        type: "success",
        message: `Usuario "${data.user.username}" creado correctamente.`,
      });
      setForm(EMPTY_FORM);
    } catch {
      setFeedback({ type: "error", message: "No se pudo conectar con el servidor." });
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadUsers() {
    setLoadingUsers(true);
    try {
      const data = await listUsers(25);
      setRecentUsers(data.rows || []);
      setShowUsers(true);
    } catch {
      setFeedback({ type: "error", message: "No se pudieron cargar los usuarios." });
    } finally {
      setLoadingUsers(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Gestión de usuarios</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Crear nuevos accesos al sistema vinculados a una persona.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLoadUsers}
          disabled={loadingUsers}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {loadingUsers ? "Cargando…" : "Ver usuarios"}
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* --- Create form --- */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Datos personales
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">
                Nombre <span className="text-red-500">*</span>
              </span>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                maxLength={250}
                placeholder="Ej. María"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">
                Apellido <span className="text-red-500">*</span>
              </span>
              <input
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                maxLength={250}
                placeholder="Ej. García"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Correo</span>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                maxLength={150}
                placeholder="correo@ejemplo.com"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Teléfono</span>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                maxLength={15}
                placeholder="Ej. 70001234"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          {/* Sección dirección */}
          <h2 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Dirección
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-600">Dirección</span>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                maxLength={250}
                placeholder="Calle, avenida, número de casa…"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Departamento</span>
              <select
                name="id_departamento"
                value={form.id_departamento}
                onChange={handleChange}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">— Seleccione —</option>
                {options.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">Municipio</span>
              <select
                name="id_municipio"
                value={form.id_municipio}
                onChange={handleChange}
                disabled={!form.id_departamento}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {form.id_departamento ? "— Seleccione —" : "Elija primero un departamento"}
                </option>
                {filteredMunicipios.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <h2 className="mb-4 mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Credenciales de acceso
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">
                Usuario <span className="text-red-500">*</span>
              </span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Ej. mgarcia"
                autoComplete="off"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-600">
                Contraseña <span className="text-red-500">*</span>
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                maxLength={250}
                placeholder="••••••••"
                autoComplete="new-password"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFeedback(null);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Crear usuario"}
            </button>
          </div>
        </form>

        {/* --- User list panel --- */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Usuarios registrados
          </h2>

          {!showUsers ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              Presiona «Ver usuarios» para cargar la lista.
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              No hay usuarios registrados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3">Usuario</th>
                    <th className="pb-2 pr-3">Nombre</th>
                    <th className="pb-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 pr-3 font-medium text-slate-700">{u.username}</td>
                      <td className="py-2 pr-3 text-slate-500">
                        {u.nombre} {u.apellido}
                      </td>
                      <td className="py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.estado === "ACTIVO"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {u.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
