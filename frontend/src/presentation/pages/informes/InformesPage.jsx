import { useEffect, useMemo, useState } from "react";
import {
  descargarReporteInformesPdf,
  obtenerOpcionesInformes,
  obtenerResumenInformes,
} from "../../../application/informes/informesUseCases.js";

const COLORS = ["#0f172a", "#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed", "#0891b2", "#be123c"];
const TIPO_LABELS = {
  PENALIDAD: "Penalidades",
  RETIRO_CICLO: "Retiros de ciclo",
  EQUIVALENCIA: "Equivalencias",
  ABSORCION: "Absorciones",
  CONSULTA: "Consultas",
  ANOTACION: "Anotaciones",
};

const FILTROS_INICIALES = {
  anio: "",
  ciclo: "",
  materia: "",
  tipoDocumento: "",
  coordinador: "",
};

const RESUMEN_INICIAL = {
  totalDocumentos: 0,
  porTipo: [],
  porEstado: [],
  porPeriodo: [],
  porCiclo: [],
  porMateria: [],
  porCoordinador: [],
  documentos: [],
};

export function InformesPage() {
  const [vista, setVista] = useState("menu");
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [opciones, setOpciones] = useState({
    tiposDocumento: [],
    anios: [],
    ciclos: [],
    materias: [],
    coordinadores: [],
    estados: [],
    carreras: [],
  });
  const [resumen, setResumen] = useState(RESUMEN_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const opcionesResult = await obtenerOpcionesInformes();
        if (mounted) setOpciones((prev) => ({ ...prev, ...opcionesResult }));
      } catch (err) {
        if (mounted) setError(err.message || "No se pudieron cargar las opciones de informes.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (vista !== "menu") cargarResumen();
  }, [vista]);

  async function cargarResumen(nextFiltros = filtros) {
    setCargando(true);
    setError("");

    try {
      const result = await obtenerResumenInformes(nextFiltros);
      setResumen({ ...RESUMEN_INICIAL, ...result });
    } catch (err) {
      setError(err.message || "No se pudo generar el informe.");
    } finally {
      setCargando(false);
    }
  }

  function abrirVista(nextVista) {
    setVista(nextVista);
  }

  function handleFiltro(field, value) {
    setFiltros((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    cargarResumen(filtros);
  }

  function handleLimpiar() {
    setFiltros(FILTROS_INICIALES);
    cargarResumen(FILTROS_INICIALES);
  }

  async function handleImprimirPdf() {
    setGenerandoPdf(true);
    setError("");

    try {
      const blob = await descargarReporteInformesPdf(filtros);
      const url = URL.createObjectURL(blob);
      const ventana = window.open(url, "_blank", "width=1000,height=850");

      if (!ventana) {
        const link = document.createElement("a");
        link.href = url;
        link.download = "reporte-informes.pdf";
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      ventana.addEventListener("load", () => {
        ventana.focus();
        ventana.print();
      });
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err.message || "No se pudo generar el PDF.");
    } finally {
      setGenerandoPdf(false);
    }
  }

  const pieSegments = useMemo(() => buildPieSegments(resumen.porTipo), [resumen.porTipo]);
  const maxPeriodo = getMax(resumen.porPeriodo);
  const maxCiclo = getMax(resumen.porCiclo);
  const maxMateria = getMax(resumen.porMateria);
  const maxCoordinador = getMax(resumen.porCoordinador);
  const estadoSegments = useMemo(() => buildPieSegments(resumen.porEstado), [resumen.porEstado]);
  const topTipo = resumen.porTipo[0];
  const topCiclo = resumen.porCiclo[0];
  const topCoordinador = resumen.porCoordinador[0];

  if (vista === "menu") {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Informes</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MenuButton
              icon="analytics"
              title="Reportes"
              detail="Dashboard con filtros y graficas consolidadas."
              onClick={() => abrirVista("reportes")}
            />
            <MenuButton
              icon="history"
              title="Histórico reportes"
              detail="Tabla de reportes generados y documentos registrados."
              onClick={() => abrirVista("historico")}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button type="button" onClick={() => setVista("menu")} className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900">
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_back</span>
              Informes
            </button>
            <h2 className="text-base font-semibold text-slate-800">
              {vista === "reportes" ? "Reportes" : "Histórico reportes"}
            </h2>
          </div>
          <div className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Total: {resumen.totalDocumentos}
          </div>
        </div>

        <FilterPanel
          filtros={filtros}
          opciones={opciones}
          onFiltro={handleFiltro}
          onSubmit={handleSubmit}
          onLimpiar={handleLimpiar}
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleImprimirPdf}
            disabled={generandoPdf}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
          >
            {generandoPdf ? "Generando PDF..." : "Imprimir reporte PDF"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}
      </section>

      {vista === "reportes" ? (
        <>
          <KpiGrid
            items={[
              { label: "Reportes creados", value: resumen.totalDocumentos, icon: "summarize" },
              { label: "Tipo principal", value: topTipo ? TIPO_LABELS[topTipo.tipo_documento] ?? topTipo.tipo_documento : "-", detail: topTipo ? `${topTipo.total} registros` : "", icon: "category" },
              { label: "Ciclo con mayor movimiento", value: topCiclo?.ciclo ?? "-", detail: topCiclo ? `${topCiclo.total} registros` : "", icon: "calendar_month" },
              { label: "Coordinador destacado", value: topCoordinador?.coordinador ?? "-", detail: topCoordinador ? `${topCoordinador.total} registros` : "", icon: "person_search" },
            ]}
          />

          <section className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">Distribución por tipo de reporte</h3>
              <div className="mt-5 flex flex-col items-center gap-5">
                <div
                  className="h-56 w-56 rounded-full border border-slate-200"
                  style={{ background: pieSegments.gradient }}
                  aria-label="Grafico de pastel por tipo de reporte"
                />
                <Legend items={resumen.porTipo.map((item, index) => ({
                  label: TIPO_LABELS[item.tipo_documento] ?? item.tipo_documento,
                  value: item.total,
                  color: COLORS[index % COLORS.length],
                }))} />
              </div>
            </div>

            <div className="grid gap-5">
              <BarChart
                title="Reportes por mes"
                items={resumen.porPeriodo.map((item) => ({ label: item.periodo, value: Number(item.total) }))}
                max={maxPeriodo}
              />
              <BarChart
                title="Reportes por ciclo"
                items={resumen.porCiclo.map((item) => ({ label: item.ciclo, value: Number(item.total) }))}
                max={maxCiclo}
              />
            </div>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <BarChart
              title="Materias con más registros"
              items={resumen.porMateria.map((item) => ({ label: item.materia, value: Number(item.total) }))}
              max={maxMateria}
            />
            <BarChart
              title="Reportes por coordinador"
              items={resumen.porCoordinador.map((item) => ({ label: item.coordinador, value: Number(item.total) }))}
              max={maxCoordinador}
            />
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
            <PieChart
              title="Reportes por estado"
              segments={estadoSegments}
              items={resumen.porEstado.map((item, index) => ({
                label: item.estado || "Sin estado",
                value: item.total,
                color: COLORS[index % COLORS.length],
              }))}
            />
            <InteractiveColumnChart
              documentos={resumen.documentos}
              periodos={resumen.porPeriodo}
              ciclos={resumen.porCiclo}
            />
          </section>

        </>
      ) : (
        <HistoricoTable documentos={resumen.documentos} cargando={cargando} />
      )}
    </main>
  );
}

function KpiGrid({ items }) {
  return (
    <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 truncate text-2xl font-semibold text-slate-900">{item.value}</p>
              {item.detail ? <p className="mt-1 truncate text-xs font-medium text-slate-500">{item.detail}</p> : null}
            </div>
            <span
              className="material-symbols-outlined rounded-lg p-2 text-white"
              style={{ backgroundColor: COLORS[index % COLORS.length], fontSize: "1.2rem" }}
            >
              {item.icon}
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}

function MenuButton({ icon, title, detail, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-40 items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
    >
      <span className="material-symbols-outlined rounded-lg bg-slate-900 p-2 text-white" style={{ fontSize: "1.35rem" }}>{icon}</span>
      <span>
        <span className="block text-lg font-semibold text-slate-900">{title}</span>
        <span className="mt-2 block text-sm leading-6 text-slate-600">{detail}</span>
      </span>
    </button>
  );
}

function FilterPanel({ filtros, opciones, onFiltro, onSubmit, onLimpiar }) {
  return (
    <form className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-6" onSubmit={onSubmit}>
      <SelectFilter label="Año" value={filtros.anio} onChange={(value) => onFiltro("anio", value)} options={opciones.anios} />
      <SelectFilter label="Ciclo" value={filtros.ciclo} onChange={(value) => onFiltro("ciclo", value)} options={opciones.ciclos} />
      <SelectFilter label="Materia" value={filtros.materia} onChange={(value) => onFiltro("materia", value)} options={opciones.materias} />
      <SelectFilter
        label="Tipo de reporte"
        value={filtros.tipoDocumento}
        onChange={(value) => onFiltro("tipoDocumento", value)}
        options={opciones.tiposDocumento}
        getLabel={(tipo) => TIPO_LABELS[tipo] ?? tipo}
      />
      <SelectFilter label="Coordinador" value={filtros.coordinador} onChange={(value) => onFiltro("coordinador", value)} options={opciones.coordinadores} />

      <div className="flex items-end gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Filtrar
        </button>
        <button type="button" onClick={onLimpiar} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          Limpiar
        </button>
      </div>
    </form>
  );
}

function SelectFilter({ label, value, onChange, options = [], getLabel = (option) => option }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>{getLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

function HistoricoTable({ documentos, cargando }) {
  const [busqueda, setBusqueda] = useState("");
  const documentosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return documentos;

    return documentos.filter((documento) => {
      const texto = [
        formatFecha(documento.fecha_documento),
        TIPO_LABELS[documento.tipo_documento] ?? documento.tipo_documento,
        documento.correlativo,
        documento.alumno_nombre,
        documento.carrera_nombre,
        documento.ciclo,
        documento.materia,
        documento.coordinador,
        documento.estado,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(termino);
    });
  }, [busqueda, documentos]);

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Tabla de reportes</h3>
          <p className="mt-1 text-xs text-slate-500">
            {documentosFiltrados.length} de {documentos.length} reportes
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 sm:w-96">
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "1.15rem" }}>search</span>
            <input
              type="search"
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Buscar por coordinador, tipo, materia, ciclo..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            {busqueda ? (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Limpiar busqueda"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
              </button>
            ) : null}
          </label>
          {cargando ? <span className="text-xs font-medium text-slate-500">Cargando...</span> : null}
        </div>
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <Th>Fecha</Th>
              <Th>Tipo</Th>
              <Th>Correlativo</Th>
              <Th>Alumno / referencia</Th>
              <Th>Carrera / facultad</Th>
              <Th>Ciclo</Th>
              <Th>Materia</Th>
              <Th>Coordinador</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {documentosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-3 py-8 text-center text-slate-500">
                  No hay reportes para la búsqueda o filtros seleccionados.
                </td>
              </tr>
            ) : (
              documentosFiltrados.map((documento) => (
                <tr key={`${documento.source_table}-${documento.id}`} className="odd:bg-white even:bg-slate-50">
                  <Td>{formatFecha(documento.fecha_documento)}</Td>
                  <Td>{TIPO_LABELS[documento.tipo_documento] ?? documento.tipo_documento}</Td>
                  <Td>{documento.correlativo || "-"}</Td>
                  <Td>{documento.alumno_nombre || "-"}</Td>
                  <Td>{documento.carrera_nombre || "-"}</Td>
                  <Td>{documento.ciclo || "-"}</Td>
                  <Td>{documento.materia || "-"}</Td>
                  <Td>{documento.coordinador || "-"}</Td>
                  <Td>{documento.estado || "-"}</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function buildPieSegments(items) {
  const total = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  if (total === 0) return { gradient: "conic-gradient(#e2e8f0 0deg 360deg)" };

  let current = 0;
  const segments = items.map((item, index) => {
    const degrees = (Number(item.total) / total) * 360;
    const segment = `${COLORS[index % COLORS.length]} ${current}deg ${current + degrees}deg`;
    current += degrees;
    return segment;
  });

  return { gradient: `conic-gradient(${segments.join(", ")})` };
}

function Legend({ items }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Sin datos para graficar.</p>;
  }

  return (
    <div className="grid w-full gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="truncate text-slate-700">{item.label}</span>
          </span>
          <span className="font-semibold text-slate-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieChart({ title, segments, items }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
        <div
          className="mx-auto h-52 w-52 rounded-full border border-slate-200 shadow-inner"
          style={{ background: segments.gradient }}
          aria-label={title}
        />
        <Legend items={items} />
      </div>
    </section>
  );
}

function InteractiveColumnChart({ documentos, periodos, ciclos }) {
  const [mode, setMode] = useState("mes");
  const items = useMemo(() => {
    if (mode === "anio") return buildYearItems(documentos);
    if (mode === "ciclo") return ciclos.map((item) => ({ label: item.ciclo, value: Number(item.total) }));
    return periodos.map((item) => ({ label: item.periodo, value: Number(item.total) }));
  }, [mode, documentos, periodos, ciclos]);
  const max = Math.max(...items.map((item) => Number(item.value)), 1);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Barras verticales por {mode === "anio" ? "año" : mode}</h3>
        <div className="inline-flex w-fit rounded-lg border border-slate-300 bg-white p-1">
          {[
            ["mes", "Mes"],
            ["anio", "Año"],
            ["ciclo", "Ciclo"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                mode === value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex h-64 items-end gap-3 overflow-x-auto border-b border-l border-slate-200 px-3 pb-4">
        {items.length === 0 ? (
          <p className="self-center text-sm text-slate-500">Sin datos para graficar.</p>
        ) : (
          items.map((item, index) => {
            const height = Math.max((item.value / max) * 100, 4);
            return (
              <button
                key={`${mode}-${item.label}`}
                type="button"
                className="group flex min-w-16 flex-1 flex-col items-center justify-end gap-2 outline-none"
                title={`${item.label}: ${item.value}`}
              >
                <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                <div className="flex h-44 w-full items-end rounded-t-lg bg-slate-100">
                  <div
                    className="w-full rounded-t-lg shadow-sm transition group-hover:brightness-110"
                    style={{
                      height: `${height}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
                <span className="w-full truncate text-center text-[11px] font-medium text-slate-500">{item.label}</span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

function BarChart({ title, items, max }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos para graficar.</p>
        ) : (
          items.map((item, index) => (
            <div key={`${title}-${item.label}`} className="grid gap-1">
              <div className="flex justify-between gap-3 text-xs font-medium text-slate-600">
                <span className="truncate">{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max((item.value / max) * 100, 3)}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Th({ children }) {
  return <th className="px-3 py-2 text-left font-semibold text-slate-700">{children}</th>;
}

function Td({ children }) {
  return <td className="border-t border-slate-200 px-3 py-2 align-top">{children}</td>;
}

function formatFecha(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-SV");
}

function getMax(items) {
  return Math.max(...items.map((item) => Number(item.total)), 1);
}

function buildYearItems(documentos = []) {
  const counts = documentos.reduce((acc, documento) => {
    if (!documento.fecha_documento) return acc;
    const year = String(new Date(documento.fecha_documento).getFullYear());
    acc[year] = (acc[year] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
