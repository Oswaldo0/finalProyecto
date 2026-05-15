import * as repo from "../../infrastructure/repositories/penalidadRepository.js";
import PDFDocument from "pdfkit";

export async function listar(filtros) {
  return repo.findAll(filtros);
}

export async function obtener(id) {
  const penalidad = await repo.findById(id);
  if (!penalidad) {
    const err = new Error("Penalidad no encontrada.");
    err.status = 404;
    throw err;
  }
  return penalidad;
}

export async function crear(body) {
  const { penalidad, asignaturas } = body;
  validarCampos(penalidad);
  return repo.create({ penalidad, asignaturas });
}

export async function actualizar(id, body) {
  await obtener(id);
  const { penalidad, asignaturas } = body;
  validarCampos(penalidad);
  return repo.update(id, { penalidad, asignaturas });
}

export async function eliminar(id) {
  await obtener(id);
  return repo.remove(id);
}

export async function generarPdf(id, res) {
  const pen = await obtener(id);

  const doc = new PDFDocument({ margin: 65, size: "LETTER" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="penalidad-${pen.correlativo}.pdf"`);
  doc.pipe(res);

  const numLetras = ["una","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez"];
  const enLetras = numLetras[(pen.asignaturas?.length ?? 1) - 1] ?? String(pen.asignaturas?.length ?? 0);
  const fechaFormateada = pen.fecha ? new Date(pen.fecha).toLocaleDateString("es-SV") : "";

  // Encabezado MEMORANDO
  doc.font("Helvetica-Bold").fontSize(10);
  const headerY = doc.y;
  doc.text("MEMORANDO:", 65, headerY);
  doc.text(`${pen.correlativo} (${pen.anio_egreso})`, 65, headerY, { align: "right" });
  doc.moveDown(0.3);
  doc.moveTo(65, doc.y).lineTo(doc.page.width - 65, doc.y).stroke();
  doc.moveDown(0.5);

  // Campos PARA / DE / ASUNTO / FECHA
  const labelW = 70;
  const valueX = 65 + labelW;
  const rowOpts = { width: doc.page.width - 65 - valueX };

  function campo(label, value) {
    const startY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).text(label, 65, startY, { width: labelW, continued: false });
    doc.font("Helvetica").fontSize(10).text(value, valueX, startY, rowOpts);
    doc.moveDown(0.2);
  }

  campo("PARA:", `${pen.secretario_nombre}\nSECRETARIO GENERAL`);
  campo("DE:", pen.decano_nombre);
  campo("ASUNTO:", `PENALIZACIÓN POR MÁS DE ${pen.cantidad_anios_egreso} AÑOS DE EGRESO`);
  campo("FECHA:", fechaFormateada);

  doc.moveDown(0.3);
  doc.moveTo(65, doc.y).lineTo(doc.page.width - 65, doc.y).stroke();
  doc.moveDown(0.8);

  // Cuerpo
  doc.font("Helvetica").fontSize(10);
  doc.text(
    `Respetuosamente informo que el bachiller ${pen.alumno_nombre} ha solicitado el reingreso a la carrera de ${pen.carrera_nombre}.`,
    { align: "justify" }
  );
  doc.moveDown(0.6);

  doc.text(
    `El bachiller egresó el ${pen.mes_egreso} de ${pen.anio_egreso}, por lo que tiene a esta fecha, ${pen.anios_egresado} años de haber egresado. Por tal razón, y de acuerdo al artículo 25 de Reglamento de Administración Académica, que en el literal a, dice que aquellos que tengan entre tres y otros años de egreso, deberán cursar las asignaturas para efecto de penalización, se les asigna que el bachiller debe aprobar a las aulas en el presente ciclo ${pen.ciclo_reingreso} o cursar las siguientes asignaturas:`,
    { align: "justify" }
  );
  doc.moveDown(0.6);

  // Asignaturas numeradas
  if (pen.asignaturas?.length > 0) {
    pen.asignaturas.forEach((a, i) => {
      const uvStr = a.uv != null ? String(a.uv).padStart(2, "0") : "  ";
      doc.text(`${i + 1}. ${a.asignatura_nombre}`, 90, doc.y, { continued: false });
      doc.text(uvStr, doc.page.width - 130, doc.y - doc.currentLineHeight(), { width: 60, align: "right" });
    });
    doc.moveDown(0.6);
  }

  doc.text(
    `Solicita se coordine con la Facultad de Tecnología Informática, para generar las condiciones informáticas que permitan al bachiller inscribir las ${enLetras} asignaturas.`,
    { align: "justify" }
  );
  doc.moveDown(1);
  doc.text("Atentamente,");

  doc.end();
}

function validarCampos(p = {}) {
  const requeridos = [
    "secretario_nombre",
    "decano_nombre",
    "fecha",
    "cantidad_anios_egreso",
    "ciclo_reingreso",
    "alumno_nombre",
    "carrera_nombre",
    "mes_egreso",
    "anio_egreso",
    "anios_egresado",
  ];

  const faltantes = requeridos.filter((k) => p[k] === undefined || p[k] === "");
  if (faltantes.length > 0) {
    const err = new Error(`Campos requeridos: ${faltantes.join(", ")}`);
    err.status = 422;
    throw err;
  }
}
