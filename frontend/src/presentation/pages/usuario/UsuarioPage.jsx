import { useEffect, useState } from "react";
import {
  crearUsuario,
  listarAuditoria,
  listarUsuarios,
} from "../../../application/usuarios/usuariosUseCases.js";
import {
  CATALOGOS_INICIALES,
  guardarCatalogosAnotaciones,
  obtenerCatalogosAnotaciones,
} from "../../../application/anotaciones/anotacionesUseCases.js";
import { toUppercaseText } from "../../utils/formNormalizers.js";

const FORM_INICIAL = {
  nombre: "",
  username: "",
  email: "",
  password: "",
  rol: "OPERADOR",
  estado: "ACTIVO",
};

export function UsuarioPage({ user }) {
  const [usuarios, setUsuarios] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [catalogos, setCatalogos] = useState(CATALOGOS_INICIALES);
  const [catalogoForm, setCatalogoForm] = useState({ observadores: "", facultades: "", horarios: "" });
  const [form, setForm] = useState(FORM_INICIAL);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const isAdmin = user?.rol === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return;

    let mounted = true;
    cargarDatos(mounted);

    return () => {
      mounted = false;
    };
  }, [isAdmin]);

  async function cargarDatos(mounted = true) {
    try {
      const [usuariosResult, auditoriaResult, catalogosResult] = await Promise.all([
        listarUsuarios({ page: 1, limit: 50 }),
        listarAuditoria({ page: 1, limit: 20 }),
        obtenerCatalogosAnotaciones(),
      ]);

      if (mounted) {
        setUsuarios(usuariosResult.data ?? []);
        setAuditoria(auditoriaResult.data ?? []);
        setCatalogos(catalogosResult);
      }
    } catch (err) {
      if (mounted) setError(err.message || "No se pudo cargar la administración de usuarios.");
    }
  }

  function handleChange(field, value) {
    const finalValue = field === "nombre" ? toUppercaseText(value) : value;
    setForm((prev) => ({ ...prev, [field]: finalValue }));
  }

  function handleCatalogoChange(tipo, value) {
    setCatalogoForm((prev) => ({ ...prev, [tipo]: toUppercaseText(value) }));
  }

  async function agregarCatalogoItem(tipo) {
    const valor = catalogoForm[tipo].trim();
    if (!valor) return;

    const actualizados = {
      ...catalogos,
      [tipo]: catalogos[tipo].includes(valor) ? catalogos[tipo] : [...catalogos[tipo], valor],
    };

    setCatalogos(actualizados);
    setCatalogoForm((prev) => ({ ...prev, [tipo]: "" }));
    await guardarCatalogosAnotaciones(actualizados);
  }

  async function eliminarCatalogoItem(tipo, valor) {
    const actualizados = {
      ...catalogos,
      [tipo]: catalogos[tipo].filter((item) => item !== valor),
    };

    setCatalogos(actualizados);
    await guardarCatalogosAnotaciones(actualizados);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMensaje("");
    setError("");

    try {
      await crearUsuario({
        ...form,
        nombre: form.nombre.trim(),
        username: form.username.trim(),
        email: form.email.trim() || null,
      });
      setForm(FORM_INICIAL);
      setMensaje("Usuario creado correctamente.");
      await cargarDatos(true);
    } catch (err) {
      setError(err.message || "No se pudo crear el usuario.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">Usuario</h2>

        <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-4">
          <InfoCard label="Nombre" value={user?.nombre} />
          <InfoCard label="Usuario" value={user?.username} />
          <InfoCard label="Rol" value={user?.rol} />
          <InfoCard label="Estado" value={user?.estado} />
        </div>
      </section>

      {isAdmin ? (
        <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(280px,360px)_1fr]">
          <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
            <h3 className="text-sm font-semibold text-slate-800">Crear usuario</h3>

            {mensaje ? <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-2 text-sm text-green-700">{mensaje}</div> : null}
            {error ? <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div> : null}

            <div className="mt-4 grid gap-3">
              <Input label="Nombre" value={form.nombre} onChange={(value) => handleChange("nombre", value)} />
              <Input label="Usuario" value={form.username} onChange={(value) => handleChange("username", value)} />
              <Input label="Correo" type="email" value={form.email} onChange={(value) => handleChange("email", value)} required={false} />
              <Input label="Contraseña" type="password" value={form.password} onChange={(value) => handleChange("password", value)} />

              <label className="grid gap-1 text-sm">
                <span className="font-medium text-slate-700">Rol</span>
                <select className="rounded-lg border border-slate-300 px-3 py-2" value={form.rol} onChange={(event) => handleChange("rol", event.target.value)}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="DECANO">DECANO</option>
                  <option value="SECRETARIO">SECRETARIO</option>
                  <option value="OPERADOR">OPERADOR</option>
                  <option value="CONSULTA">CONSULTA</option>
                </select>
              </label>
            </div>

            <button type="submit" className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Guardar usuario
            </button>
          </form>

          <div className="grid gap-5">
            <DataTable
              title="Usuarios registrados"
              columns={["Usuario", "Nombre", "Rol", "Estado"]}
              rows={usuarios.map((item) => [item.username, item.nombre, item.rol, item.estado])}
              emptyText="No hay usuarios registrados."
            />
            <DataTable
              title="Últimos eventos de auditoría"
              columns={["Fecha", "Usuario", "Acción", "Ruta"]}
              rows={auditoria.map((item) => [
                item.created_at ? new Date(item.created_at).toLocaleString("es-SV") : "-",
                item.username || "-",
                item.accion,
                item.ruta,
              ])}
              emptyText="No hay eventos de auditoría."
            />
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Catálogos para observación de clases</h3>
              <p className="mt-1 text-xs text-slate-500">
                Solo los administradores pueden agregar observadores, facultades y horarios para el apartado de Anotaciones.
              </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <CatalogManager
                title="Observadores"
                inputLabel="Nuevo observador"
                value={catalogoForm.observadores}
                items={catalogos.observadores}
                onChange={(value) => handleCatalogoChange("observadores", value)}
                onAdd={() => agregarCatalogoItem("observadores")}
                onRemove={(item) => eliminarCatalogoItem("observadores", item)}
              />
              <CatalogManager
                title="Facultades"
                inputLabel="Nueva facultad"
                value={catalogoForm.facultades}
                items={catalogos.facultades}
                onChange={(value) => handleCatalogoChange("facultades", value)}
                onAdd={() => agregarCatalogoItem("facultades")}
                onRemove={(item) => eliminarCatalogoItem("facultades", item)}
              />
              <CatalogManager
                title="Horarios"
                inputLabel="Nuevo horario"
                value={catalogoForm.horarios}
                items={catalogos.horarios}
                onChange={(value) => handleCatalogoChange("horarios", value)}
                onAdd={() => agregarCatalogoItem("horarios")}
                onRemove={(item) => eliminarCatalogoItem("horarios", item)}
              />
            </div>
          </section>
        </section>
      ) : null}
    </main>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate font-medium">{value || "-"}</p>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = true }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2"
        required={required}
      />
    </label>
  );
}

function CatalogManager({ title, inputLabel, value, items, onChange, onAdd, onRemove }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder={inputLabel}
        />
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Agregar
        </button>
      </div>
      <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white">
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">Sin registros.</p>
        ) : (
          items.map((item) => (
            <div key={item} className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 last:border-b-0">
              <span className="text-xs font-medium text-slate-700">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                Quitar
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DataTable({ title, columns, rows, emptyText }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 text-left font-semibold text-slate-700">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="odd:bg-white even:bg-slate-50">
                  {row.map((cell, cellIndex) => (
                    <td key={`${title}-${index}-${cellIndex}`} className="border-t border-slate-200 px-3 py-2">
                      {cell || "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
