import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logoPath = path.resolve(__dirname, "../../shared/assets/LOGO_USO.png");

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

function drawHeader(document, student) {
  const startX = document.page.margins.left;
  const contentWidth =
    document.page.width - document.page.margins.left - document.page.margins.right;

  document
    .roundedRect(startX, 40, contentWidth, 95, 10)
    .fillAndStroke("#f8fafc", "#cbd5e1");

  if (fs.existsSync(logoPath)) {
    try {
      document.image(logoPath, startX + 16, 56, { width: 64 });
    } catch (logoError) {
      console.error("Error al cargar logo:", logoError.message);
    }
  }

  document
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#0f172a")
    .text("Universidad de Sonsonate", startX + 90, 58)
    .fontSize(12)
    .fillColor("#334155")
    .text("Reporte de estudiante", startX + 90, 80)
    .fontSize(10)
    .fillColor("#64748b")
    .text(`Expediente: ${student.expediente ?? "N/A"}`, startX + 90, 100)
    .text(`Generado: ${new Date().toLocaleString("es-SV")}`, startX + 250, 100);

  document.y = 160;
}

function drawSectionTitle(document, title) {
  document.moveDown(0.3);
  document
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#1e293b")
    .text(title);
  document
    .moveTo(document.page.margins.left, document.y + 2)
    .lineTo(document.page.width - document.page.margins.right, document.y + 2)
    .lineWidth(1)
    .strokeColor("#e2e8f0")
    .stroke();
  document.moveDown(0.5);
}

export function buildStudentReportPdf(student) {
  const document = new PDFDocument({ margin: 50, size: "A4" });

  document.info.Title = `Reporte estudiante ${student.expediente}`;
  drawHeader(document, student);

  drawSectionTitle(document, "Datos personales");
  writeField(document, "expediente:", student.expediente);
  writeField(document, "nombre:", student.nombre);
  writeField(document, "apellido:", student.apellido);
  writeField(document, "correo:", student.correo);
  writeField(document, "telefono:", student.telefono);

  drawSectionTitle(document, "Direccion");
  writeField(document, "direccion:", student.direccion);
  writeField(document, "departamento:", student.departamento);
  writeField(document, "municipio:", student.municipio);

  drawSectionTitle(document, "Datos academicos");
  writeField(document, "cum:", student.cum);
  writeField(document, "calidad:", student.calidad);
  writeField(document, "anio_ingreso:", student.year_ingreso);
  writeField(document, "plan_estudio:", student.plan_estudio);
  writeField(document, "carrera:", student.carrera);
  writeField(document, "facultad:", student.facultad);
  writeField(document, "estado:", student.estado);

  document
    .moveDown(1)
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor("#64748b")
    .text("Documento generado automaticamente por el sistema academico.", {
      align: "center",
    });

  return document;
}
