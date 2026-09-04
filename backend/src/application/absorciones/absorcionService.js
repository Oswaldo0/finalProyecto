import * as repo from "../../infrastructure/repositories/absorcionRepository.js";
import PDFDocument from "pdfkit";
import {
  assertAcademicCycle,
  assertNonNegativeDecimal,
  assertValidDate,
  requireFields,
  requireObject,
  validationError,
} from "../shared/validation.js";

export async function listar(filtros) {
  return repo.findAll(filtros);
}

export async function obtener(id) {
  const absorcion = await repo.findById(id);
  if (!absorcion) {
    const err = new Error("Absorción no encontrada.");
    err.status = 404;
    throw err;
  }
  return absorcion;
}

export async function crear(body) {
  const { absorcion, absorbidas = [], noExistentes = [], reprobadas = [] } = body;
  validarCampos(absorcion);
  validarDetalles({ absorbidas, noExistentes, reprobadas });
  return repo.create({ absorcion, absorbidas, noExistentes, reprobadas });
}

export async function actualizar(id, body) {
  await obtener(id);
  const { absorcion, absorbidas = [], noExistentes = [], reprobadas = [] } = body;
  validarCampos(absorcion);
  validarDetalles({ absorbidas, noExistentes, reprobadas });
  return repo.update(id, { absorcion, absorbidas, noExistentes, reprobadas });
}

export async function marcarImpresa(id) {
  await obtener(id);
  return repo.markAsPrinted(id);
}

export async function eliminar(id) {
  await obtener(id);
  return repo.remove(id);
}

export async function generarPdf(id, res) {
  const abs = await obtener(id);
  const doc = new PDFDocument({ margin: 60, size: "LETTER" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="absorcion-${abs.correlativo}.pdf"`);
  doc.pipe(res);

  const fechaFormateada = abs.fecha ? new Date(abs.fecha).toLocaleDateString("es-SV") : "";

  doc.font("Helvetica-Bold").fontSize(12).text("DICTAMEN DE ABSORCIÓN", { align: "center" });
  doc.moveDown(1);

  doc.fontSize(10).font("Helvetica");
  doc.text(`Facultad: ${abs.facultad_nombre}`);
  doc.text(`Ciclo: ${abs.ciclo}`);
  doc.text(`Fecha: ${fechaFormateada}`);
  doc.text(`Correlativo: ${abs.correlativo}`);
  doc.moveDown(0.7);

  doc.font("Helvetica-Bold").text("Datos del estudiante:");
  doc.font("Helvetica");
  doc.text(`Nombre: ${abs.alumno_nombres} ${abs.alumno_apellidos}`);
  doc.text(`Carrera de origen: ${abs.carrera_origen}`);
  doc.text(`Plan de origen: ${abs.plan_origen}`);
  doc.text(`Plan solicitado: ${abs.plan_solicitado}`);
  doc.moveDown(0.7);

  doc.font("Helvetica-Bold").text("Encabezado del dictamen:");
  doc.font("Helvetica");
  doc.text(abs.encabezado_dictamen, { align: "justify" });
  doc.moveDown(0.7);

  if (abs.absorbidas?.length) {
    doc.font("Helvetica-Bold").text("Asignaturas absorbidas:");
    abs.absorbidas.forEach((item, index) => {
      doc.font("Helvetica").text(
        `${index + 1}. ${item.asignatura_cursada} → ${item.asignatura_absorbida} ${item.nota_asignada != null ? `(Nota: ${item.nota_asignada})` : ""}`,
        { indent: 12 },
      );
    });
    doc.moveDown(0.5);
  }

  if (abs.noExistentes?.length) {
    doc.font("Helvetica-Bold").text("Pierde por no existir en plan solicitado:");
    abs.noExistentes.forEach((item, index) => {
      doc.font("Helvetica").text(
        `${index + 1}. ${item.asignatura_nombre} ${item.nota != null ? `(Nota: ${item.nota})` : ""}`,
        { indent: 12 },
      );
    });
    doc.moveDown(0.5);
  }

  if (abs.reprobadas?.length) {
    doc.font("Helvetica-Bold").text("Asignaturas cursadas, reprobadas y absorbidas:");
    abs.reprobadas.forEach((item, index) => {
      doc.font("Helvetica").text(
        `${index + 1}. ${item.asignatura_nombre} ${item.nota != null ? `(Nota: ${item.nota})` : ""}`,
        { indent: 12 },
      );
    });
    doc.moveDown(0.7);
  }

  doc.font("Helvetica-Bold").text("Firma:");
  doc.font("Helvetica");
  doc.text(`Decano: ${abs.decano_nombre}`);
  doc.text(`Facultad que firma: ${abs.facultad_firma_nombre}`);

  doc.end();
}

function validarCampos(absorcion = {}) {
  requireObject(absorcion, "absorcion");
  const requeridos = [
    "facultad_nombre",
    "ciclo",
    "fecha",
    "alumno_nombres",
    "alumno_apellidos",
    "carrera_origen",
    "plan_origen",
    "plan_solicitado",
    "encabezado_dictamen",
    "decano_nombre",
    "facultad_firma_nombre",
  ];

  requireFields(absorcion, requeridos);
  assertValidDate(absorcion.fecha, "fecha", { required: true });
  assertAcademicCycle(absorcion.ciclo, "ciclo");
}

function validarDetalles({ absorbidas = [], noExistentes = [], reprobadas = [] }) {
  if (absorbidas.length + noExistentes.length + reprobadas.length === 0) {
    throw validationError("Debe registrar al menos una asignatura en el dictamen.");
  }

  absorbidas.forEach((item, index) => {
    requireObject(item, `absorbidas[${index}]`);
    requireFields(item, ["asignatura_cursada", "asignatura_absorbida"]);
    assertNonNegativeDecimal(item.nota_asignada, `absorbidas[${index}].nota_asignada`);
  });

  noExistentes.forEach((item, index) => {
    requireObject(item, `noExistentes[${index}]`);
    requireFields(item, ["asignatura_nombre"]);
    assertNonNegativeDecimal(item.nota, `noExistentes[${index}].nota`);
  });

  reprobadas.forEach((item, index) => {
    requireObject(item, `reprobadas[${index}]`);
    requireFields(item, ["asignatura_nombre"]);
    assertNonNegativeDecimal(item.nota, `reprobadas[${index}].nota`);
  });
}
