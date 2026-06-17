import { useEffect, useMemo, useState } from "react";
import {
  descargarReporteInformesPdf,
  obtenerOpcionesInformes,
  obtenerResumenInformes,
} from "../../../application/informes/informesUseCases.js";

const COLORS = ["#0f172a", "#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed"];
const TIPO_LABELS = {
  PENALIDAD: "Penalidades",
  RETIRO_CICLO: "Retiros de ciclo",
  EQUIVALENCIA: "Equivalencias",
  ABSORCION: "Absorciones",
};

const FILTROS_INICIALES = {
  fechaDesde: "",
  fechaHasta: "",
  tipoDocumento: "",
  estado: "",
};

export function InformesPage() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [opciones, setOpciones] = useState({ tiposDocumento: [], estados: [], carreras: [] });
  const [resumen, setResumen] = useState({
    totalDocumentos: 0,
    porTipo: [],
    porEstado: [],
    porPeriodo: [],
    documentos: [],
  });
  const [cargando, setCargando] = useState(true);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const opcionesResult = await obtenerOpcionesInformes();
        if (mounted) setOpciones(opcionesResult);
      } catch (err) {
        if (mounted) setError(err.message || "No se pudieron cargar las opciones de informes.");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    cargarResumen();
  }, []);

  async function cargarResumen(nextFiltros = filtros) {
    setCargando(true);
    setError("");

    try {
      const result = await obtenerResumenInformes(nextFiltros);
      setResumen(result);
    } catch (err) {
      setError(err.message || "No se pudo generar el informe.");
    } finally {
      setCargando(false);
    }
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
  const maxPeriodo = Math.max(...resumen.porPeriodo.map((item) => Number(item.total)), 1);
  const maxEstado = Math.max(...resumen.porEstado.map((item) => Number(item.total)), 1);
  const desviacionMensual = useMemo(() => buildDeviationItems(resumen.porPeriodo), [resumen.porPeriodo]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Informes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Consolidado de documentos académicos por tipo, estado y periodo.
            </p>
          </div>
          <div className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Total: {resumen.totalDocumentos}
          </div>
        </div>

        <form className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-5" onSubmit={handleSubmit}>
          <FilterInput label="Desde" type="date" value={filtros.fechaDesde} onChange={(value) => handleFiltro("fechaDesde", value)} />
          <FilterInput label="Hasta" type="date" value={filtros.fechaHasta} onChange={(value) => handleFiltro("fechaHasta", value)} />

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Documento</span>
            <select className="rounded-lg border border-slate-300 bg-white px-3 py-2" value={filtros.tipoDocumento} onChange={(event) => handleFiltro("tipoDocumento", event.target.value)}>
              <option value="">Todos</option>
              {opciones.tiposDocumento.map((tipo) => (
                <option key={tipo} value={tipo}>{TIPO_LABELS[tipo] ?? tipo}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium text-slate-700">Estado</span>
            <select className="rounded-lg border border-slate-300 bg-white px-3 py-2" value={filtros.estado} onChange={(event) => handleFiltro("estado", event.target.value)}>
              <option value="">Todos</option>
              {opciones.estados.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button type="submit" className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Filtrar
            </button>
            <button type="button" onClick={handleLimpiar} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Limpiar
            </button>
          </div>
        </form>

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

      <section className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Distribución por tipo</h3>
          <div className="mt-5 flex flex-col items-center gap-5">
            <div
              className="h-56 w-56 rounded-full border border-slate-200"
              style={{ background: pieSegments.gradient }}
              aria-label="Gráfico de pastel por tipo de documento"
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
            title="Documentos por mes"
            items={resumen.porPeriodo.map((item) => ({ label: item.periodo, value: Number(item.total) }))}
            max={maxPeriodo}
          />
          <BarChart
            title="Documentos por estado"
            items={resumen.porEstado.map((item) => ({ label: item.estado || "Sin estado", value: Number(item.total) }))}
            max={maxEstado}
          />
          <DeviationChart title="Desviación mensual respecto al promedio" data={desviacionMensual} />
        </div>
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Detalle de documentos</h3>
          {cargando ? <span className="text-xs font-medium text-slate-500">Cargando...</span> : null}
        </div>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <Th>Fecha</Th>
                <Th>Tipo</Th>
                <Th>Correlativo</Th>
                <Th>Alumno</Th>
                <Th>Carrera</Th>
                <Th>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {resumen.documentos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-8 text-center text-slate-500">
                    No hay documentos para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                resumen.documentos.map((documento) => (
                  <tr key={documento.id} className="odd:bg-white even:bg-slate-50">
                    <Td>{formatFecha(documento.fecha_documento)}</Td>
                    <Td>{TIPO_LABELS[documento.tipo_documento] ?? documento.tipo_documento}</Td>
                    <Td>{documento.correlativo || "-"}</Td>
                    <Td>{documento.alumno_nombre || "-"}</Td>
                    <Td>{documento.carrera_nombre || "-"}</Td>
                    <Td>{documento.estado || "-"}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function FilterInput({ label, type, value, onChange }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input type={type} className="rounded-lg border border-slate-300 bg-white px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
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
                <span>{item.label}</span>
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

function DeviationChart({ title, data }) {
  const maxDeviation = Math.max(...data.items.map((item) => Math.abs(item.deviation)), 1);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="text-xs font-medium text-slate-500">Promedio: {data.average.toFixed(2)}</span>
      </div>
      <div className="mt-4 grid gap-3">
        {data.items.length === 0 ? (
          <p className="text-sm text-slate-500">Sin datos para graficar.</p>
        ) : (
          data.items.map((item) => {
            const width = Math.max((Math.abs(item.deviation) / maxDeviation) * 50, 2);
            const isPositive = item.deviation >= 0;
            return (
              <div key={item.label} className="grid gap-1">
                <div className="flex justify-between gap-3 text-xs font-medium text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.deviation.toFixed(1)}</span>
                </div>
                <div className="relative grid h-4 grid-cols-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="relative">
                    <div className="absolute right-0 top-0 h-full w-px bg-slate-400" />
                    {!isPositive ? (
                      <div className="absolute right-0 top-0 h-full rounded-l-full bg-red-600" style={{ width: `${width}%` }} />
                    ) : null}
                  </div>
                  <div className="relative">
                    {isPositive ? (
                      <div className="absolute left-0 top-0 h-full rounded-r-full bg-green-600" style={{ width: `${width}%` }} />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function Th({ children }) {
  return <th className="px-3 py-2 text-left font-semibold text-slate-700">{children}</th>;
}

function Td({ children }) {
  return <td className="border-t border-slate-200 px-3 py-2">{children}</td>;
}

function formatFecha(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-SV");
}

function buildDeviationItems(items) {
  const normalized = items.map((item) => ({ label: item.periodo, value: Number(item.total) }));
  const average = normalized.length > 0
    ? normalized.reduce((sum, item) => sum + item.value, 0) / normalized.length
    : 0;

  return {
    average,
    items: normalized.map((item) => ({
      ...item,
      deviation: item.value - average,
    })),
  };
}
