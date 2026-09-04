import PDFDocument from "pdfkit";
import * as repo from "../../infrastructure/repositories/informeRepository.js";

const TIPO_LABELS = {
  PENALIDAD: "Penalidades",
  RETIRO_CICLO: "Retiros de ciclo",
  EQUIVALENCIA: "Equivalencias",
  ABSORCION: "Absorciones",
  CONSULTA: "Consultas",
  ANOTACION: "Anotaciones",
};

const CHART_COLORS = ["#0f172a", "#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed", "#0891b2", "#be123c"];
const PAGE = {
  margin: 36,
  headerHeight: 42,
};

export function obtenerResumen(filtros) {
  validarFechas(filtros);
  return repo.obtenerResumen(filtros);
}

export function obtenerOpciones() {
  return repo.obtenerOpciones();
}

export async function generarPdf(filtros, res) {
  validarFechas(filtros);
  const resumen = await repo.obtenerResumen(filtros);
  const doc = new PDFDocument({
    bufferPages: true,
    layout: "landscape",
    margin: PAGE.margin,
    size: "LETTER",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="reporte-informes.pdf"');
  doc.pipe(res);

  renderPageHeader(doc, "Reporte de informes");
  renderFiltersBox(doc, filtros);
  renderKpiCards(doc, resumen);

  renderSectionTitle(doc, "Dashboard de reportes");
  renderBarChart(doc, "Reportes por tipo", resumen.porTipo.map((item) => ({
    label: TIPO_LABELS[item.tipo_documento] ?? item.tipo_documento,
    value: Number(item.total),
  })));
  renderBarChart(doc, "Reportes por mes", resumen.porPeriodo.map((item) => ({
    label: item.periodo,
    value: Number(item.total),
  })));
  renderBarChart(doc, "Reportes por ciclo", resumen.porCiclo.map((item) => ({
    label: item.ciclo,
    value: Number(item.total),
  })));
  renderBarChart(doc, "Materias con más registros", resumen.porMateria.map((item) => ({
    label: item.materia,
    value: Number(item.total),
  })));
  renderBarChart(doc, "Reportes por coordinador", resumen.porCoordinador.map((item) => ({
    label: item.coordinador,
    value: Number(item.total),
  })));
  renderBarChart(doc, "Reportes por estado", resumen.porEstado.map((item) => ({
    label: item.estado || "Sin estado",
    value: Number(item.total),
  })));

  ensureSpace(doc, 110);
  renderSectionTitle(doc, "Histórico de reportes");
  renderDocumentsTable(doc, resumen.documentos);
  renderPageNumbers(doc);

  doc.end();
}

function validarFechas({ fechaDesde, fechaHasta } = {}) {
  if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
    const err = new Error("La fecha inicial no puede ser mayor que la fecha final.");
    err.status = 422;
    throw err;
  }
}

function renderPageHeader(doc, title) {
  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(14).text("Universidad de Sonsonate", {
    align: "left",
  });
  doc.font("Helvetica").fontSize(10).text(title, { align: "left" });
  doc.fontSize(8).fillColor("#475569").text(`Generado: ${new Date().toLocaleString("es-SV")}`, {
    align: "right",
  });
  doc.moveTo(PAGE.margin, PAGE.headerHeight + 18)
    .lineTo(doc.page.width - PAGE.margin, PAGE.headerHeight + 18)
    .strokeColor("#cbd5e1")
    .stroke();
  doc.strokeColor("#000000").fillColor("#111827");
  doc.y = PAGE.headerHeight + 30;
}

function renderFiltersBox(doc, filtros) {
  const x = PAGE.margin;
  const y = doc.y;
  const width = contentWidth(doc);
  const height = 74;
  const cols = [
    ["Año", filtros.anio || "Todos"],
    ["Ciclo", filtros.ciclo || "Todos"],
    ["Materia", filtros.materia || "Todas"],
    ["Tipo", filtros.tipoDocumento ? TIPO_LABELS[filtros.tipoDocumento] ?? filtros.tipoDocumento : "Todos"],
    ["Coordinador", filtros.coordinador || "Todos"],
  ];
  const colWidth = width / cols.length;

  doc.roundedRect(x, y, width, height, 6).fillAndStroke("#f8fafc", "#cbd5e1");
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#334155").text("Filtros aplicados", x + 12, y + 8);

  cols.forEach(([label, value], index) => {
    const colX = x + index * colWidth + 12;
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#64748b").text(label.toUpperCase(), colX, y + 25, {
      width: colWidth - 18,
    });
    doc.font("Helvetica").fontSize(8).fillColor("#111827").text(String(value), colX, y + 36, {
      width: colWidth - 18,
      ellipsis: true,
    });
  });

  doc.font("Helvetica").fontSize(7.5).fillColor("#64748b").text(
    `Rango de fechas: ${filtros.fechaDesde || "Sin inicio"} - ${filtros.fechaHasta || "Sin fin"}${filtros.estado ? ` | Estado: ${filtros.estado}` : ""}`,
    x + 12,
    y + 58,
    { width: width - 24, ellipsis: true },
  );

  doc.y = y + height + 14;
}

function renderKpiCards(doc, resumen) {
  const topTipo = resumen.porTipo[0];
  const topCiclo = resumen.porCiclo[0];
  const topCoordinador = resumen.porCoordinador[0];
  const cards = [
    ["Reportes creados", resumen.totalDocumentos],
    ["Tipo principal", topTipo ? TIPO_LABELS[topTipo.tipo_documento] ?? topTipo.tipo_documento : "-"],
    ["Ciclo con mayor movimiento", topCiclo?.ciclo ?? "-"],
    ["Coordinador destacado", topCoordinador?.coordinador ?? "-"],
  ];
  const gap = 10;
  const width = (contentWidth(doc) - gap * (cards.length - 1)) / cards.length;
  const height = 48;
  const y = doc.y;

  cards.forEach(([label, value], index) => {
    const x = PAGE.margin + index * (width + gap);
    doc.roundedRect(x, y, width, height, 6).fillAndStroke("#ffffff", "#cbd5e1");
    doc.font("Helvetica").fontSize(7.5).fillColor("#64748b").text(label, x + 10, y + 9, { width: width - 20 });
    doc.font("Helvetica-Bold").fontSize(String(value).length > 18 ? 9 : 13).fillColor("#0f172a").text(String(value), x + 10, y + 24, {
      width: width - 20,
      ellipsis: true,
    });
  });

  doc.y = y + height + 18;
}

function renderSectionTitle(doc, title) {
  ensureSpace(doc, 28);
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text(title);
  doc.moveDown(0.4);
}

function renderBarChart(doc, title, items) {
  const rowHeight = 15;
  const height = Math.max(78, 34 + Math.min(items.length, 18) * rowHeight);
  ensureSpace(doc, height + 12);

  const x = PAGE.margin;
  const y = doc.y;
  const width = contentWidth(doc);
  const labelWidth = 142;
  const valueWidth = 42;
  const barWidth = width - labelWidth - valueWidth - 34;
  const max = Math.max(...items.map((item) => item.value), 1);

  renderChartFrame(doc, x, y, width, height, title);

  if (items.length === 0) {
    doc.font("Helvetica").fontSize(8).fillColor("#64748b").text("Sin datos para graficar.", x + 14, y + 34);
    doc.y = y + height + 12;
    return;
  }

  let rowY = y + 32;
  items.slice(0, 18).forEach((item, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
    const length = Math.max((item.value / max) * barWidth, item.value > 0 ? 3 : 0);

    doc.font("Helvetica").fontSize(7.4).fillColor("#334155").text(item.label, x + 14, rowY + 1, {
      width: labelWidth,
      ellipsis: true,
    });
    doc.roundedRect(x + 14 + labelWidth, rowY, barWidth, 8, 3).fill("#e2e8f0");
    doc.roundedRect(x + 14 + labelWidth, rowY, length, 8, 3).fill(color);
    doc.font("Helvetica-Bold").fontSize(7.4).fillColor("#0f172a").text(String(item.value), x + 22 + labelWidth + barWidth, rowY - 1, {
      width: valueWidth,
      align: "right",
    });
    rowY += rowHeight;
  });

  if (items.length > 18) {
    doc.font("Helvetica").fontSize(7).fillColor("#64748b").text(`+ ${items.length - 18} registros adicionales`, x + 14, y + height - 14);
  }

  doc.fillColor("#111827");
  doc.y = y + height + 12;
}

function renderChartFrame(doc, x, y, width, height, title) {
  doc.roundedRect(x, y, width, height, 7).fillAndStroke("#ffffff", "#cbd5e1");
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#0f172a").text(title, x + 14, y + 10, {
    width: width - 28,
  });
}

function renderDocumentsTable(doc, documentos) {
  const startX = PAGE.margin;
  const widths = [52, 78, 74, 104, 104, 50, 104, 98, 56];
  const headers = ["Fecha", "Tipo", "Correlativo", "Alumno / ref.", "Carrera / facultad", "Ciclo", "Materia", "Coordinador", "Estado"];
  let y = doc.y;

  function renderHeader() {
    ensureSpace(doc, 34);
    y = doc.y;
    doc.roundedRect(startX, y, contentWidth(doc), 20, 4).fill("#e2e8f0");
    doc.font("Helvetica-Bold").fontSize(7.6).fillColor("#0f172a");
    headers.forEach((header, index) => {
      doc.text(header, startX + 8 + sumWidths(widths, index), y + 6, { width: widths[index] - 8 });
    });
    y += 24;
    doc.y = y;
  }

  renderHeader();

  if (documentos.length === 0) {
    doc.font("Helvetica").fontSize(8).fillColor("#64748b").text("No hay reportes para los filtros seleccionados.", startX, y);
    return;
  }

  documentos.forEach((documento, index) => {
    const row = [
      formatFecha(documento.fecha_documento),
      TIPO_LABELS[documento.tipo_documento] ?? documento.tipo_documento,
      documento.correlativo || "-",
      documento.alumno_nombre || "-",
      documento.carrera_nombre || "-",
      documento.ciclo || "-",
      documento.materia || "-",
      documento.coordinador || "-",
      documento.estado || "-",
    ];
    const rowHeight = Math.max(
      ...row.map((cell, cellIndex) => doc.heightOfString(String(cell), { width: widths[cellIndex] - 8 })),
      12,
    ) + 8;

    if (y + rowHeight > doc.page.height - PAGE.margin - 22) {
      doc.addPage();
      renderPageHeader(doc, "Histórico de reportes");
      renderHeader();
    }

    if (index % 2 === 0) {
      doc.rect(startX, y - 2, contentWidth(doc), rowHeight).fill("#f8fafc");
    }

    doc.font("Helvetica").fontSize(6.6).fillColor("#111827");
    row.forEach((cell, cellIndex) => {
      doc.text(String(cell), startX + 8 + sumWidths(widths, cellIndex), y + 2, {
        width: widths[cellIndex] - 8,
      });
    });
    y += rowHeight;
    doc.y = y;
  });
}

function renderPageNumbers(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.font("Helvetica").fontSize(7).fillColor("#64748b").text(
      `Página ${i + 1} de ${range.count}`,
      PAGE.margin,
      doc.page.height - 24,
      { align: "right", width: contentWidth(doc) },
    );
  }
}

function ensureSpace(doc, height = 60) {
  if (doc.y + height > doc.page.height - PAGE.margin - 18) {
    doc.addPage();
    renderPageHeader(doc, "Reporte de informes");
  }
}

function contentWidth(doc) {
  return doc.page.width - PAGE.margin * 2;
}

function sumWidths(widths, untilIndex) {
  return widths.slice(0, untilIndex).reduce((sum, width) => sum + width, 0);
}

function formatFecha(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-SV");
}
