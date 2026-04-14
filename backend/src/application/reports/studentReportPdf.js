import PDFDocument from "pdfkit";

function writeField(document, label, value) {
  document
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#334155")
    .text(label, { continued: true })
    .font("Helvetica")
    .fillColor("#0f172a")
    .text(` ${value ?? "NULL"}`);
}

export function buildStudentReportPdf(student) {
  const document = new PDFDocument({ margin: 50, size: "A4" });

  document.info.Title = `Reporte estudiante ${student.expediente}`;
  document.fontSize(18).font("Helvetica-Bold").fillColor("#0f172a").text("Reporte de estudiante");
  document.moveDown(0.5);
  document.fontSize(11).font("Helvetica").fillColor("#475569").text("Informe generado desde BD_USO_SONSONATE");
  document.moveDown(1.5);

  writeField(document, "expediente:", student.expediente);
  writeField(document, "nombres:", student.nombres);
  writeField(document, "apellidos:", student.apellidos);
  writeField(document, "cum:", student.cum);
  writeField(document, "num_carnet:", student.num_carnet);
  writeField(document, "calidad:", student.calidad);
  writeField(document, "direccion:", student.direccion);
  writeField(document, "departamento:", student.departamento);
  writeField(document, "municipio:", student.municipio);
  writeField(document, "telefono:", student.telefono);
  writeField(document, "correo:", student.correo);
  writeField(document, "carrera:", student.carrera);
  writeField(document, "facultad:", student.facultad);
  writeField(document, "edad:", student.edad);
  writeField(document, "fecha_nac:", student.fecha_nac);
  writeField(document, "responsable:", student.responsable);
  writeField(document, "estado_academico:", student.estado_academico);
  writeField(document, "institucion_proc:", student.institucion_proc);
  writeField(document, "anio_ingreso:", student.anio_ingreso);
  writeField(document, "ciclo:", student.ciclo);
  writeField(document, "anio_ciclo:", student.anio_ciclo);
  writeField(document, "grupo:", student.grupo);
  writeField(document, "plan_de_estudio:", student.plan_de_estudio);
  writeField(document, "empleo:", student.empleo);

  document.end();
  return document;
}
