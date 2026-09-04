import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const docsDir = path.join(rootDir, "docs");
const inputPath = path.join(docsDir, "MANUAL_USO.md");
const outputPath = path.join(docsDir, "MANUAL_USO.pdf");
const logoPath = path.join(rootDir, "frontend/src/assets/images/LOGO_USO.png");

const PAGE = {
  margin: 54,
  bottom: 58,
};

const COLORS = {
  ink: "#0f172a",
  text: "#1f2937",
  muted: "#64748b",
  line: "#cbd5e1",
  soft: "#f8fafc",
  signal: "#AD0209",
};

const markdown = fs.readFileSync(inputPath, "utf8");
const doc = new PDFDocument({
  bufferPages: true,
  margin: PAGE.margin,
  size: "LETTER",
  info: {
    Title: "Manual de uso del Sistema Académico USO",
    Author: "Universidad de Sonsonate",
    Subject: "Manual de usuario",
  },
});

const output = fs.createWriteStream(outputPath);
doc.pipe(output);

renderCover();
renderMarkdown(markdown);
renderPageNumbers();

doc.end();

await new Promise((resolve, reject) => {
  output.on("finish", resolve);
  output.on("error", reject);
});

console.log(`Manual PDF generado: ${outputPath}`);

function renderCover() {
  if (isSupportedImage(logoPath)) {
    doc.image(logoPath, PAGE.margin, 42, { width: 72 });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(COLORS.ink)
    .text("Manual de uso", PAGE.margin, 145, { align: "center" });

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(COLORS.signal)
    .text("Sistema Académico USO", { align: "center" });

  doc.moveDown(1.2);
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(COLORS.text)
    .text(
      "Guía para crear, modificar, imprimir y consultar reportes académicos administrativos.",
      PAGE.margin + 44,
      doc.y,
      { align: "center", width: contentWidth() - 88 },
    );

  doc.moveDown(2);
  drawSignalBox("SEÑALES", "El manual usa [RUTA], [CLIC], [IMPORTANTE], [RESULTADO] y [ERROR] para orientar cada acción.");

  doc.moveDown(2);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(`Generado: ${new Date().toLocaleDateString("es-SV")}`, { align: "center" });

  doc.addPage();
}

function renderMarkdown(text) {
  const lines = text.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trimEnd();

    if (!line.trim()) {
      doc.moveDown(0.35);
      continue;
    }

    if (line.startsWith("# ")) {
      continue;
    }

    if (line.startsWith("## ")) {
      renderHeading(line.replace(/^##\s+/, ""), 1);
      continue;
    }

    if (line.startsWith("### ")) {
      renderHeading(line.replace(/^###\s+/, ""), 2);
      continue;
    }

    if (line.startsWith("<img ")) {
      renderImage(line);
      continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      index -= 1;
      renderTable(tableLines);
      continue;
    }

    if (line.startsWith("- ")) {
      renderBullet(line.slice(2));
      continue;
    }

    const numbered = line.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      renderNumbered(numbered[1], numbered[2]);
      continue;
    }

    renderParagraph(line);
  }
}

function renderHeading(text, level) {
  ensureSpace(level === 1 ? 42 : 30);
  doc.moveDown(level === 1 ? 0.8 : 0.4);
  doc
    .font("Helvetica-Bold")
    .fontSize(level === 1 ? 15 : 12)
    .fillColor(level === 1 ? COLORS.ink : COLORS.signal)
    .text(cleanInline(text), { width: contentWidth() });
  doc.moveDown(0.35);

  if (level === 1) {
    doc
      .moveTo(PAGE.margin, doc.y)
      .lineTo(doc.page.width - PAGE.margin, doc.y)
      .strokeColor(COLORS.line)
      .stroke();
    doc.moveDown(0.45);
  }
}

function renderParagraph(text) {
  const cleaned = cleanInline(text);
  ensureSpace(28);

  const signal = cleaned.match(/^\[(RUTA|CLIC|IMPORTANTE|RESULTADO|ERROR|SEÑAL)\]\s*(.*)$/);
  if (signal) {
    drawSignalBox(signal[1], signal[2]);
    return;
  }

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.text)
    .text(cleaned, {
      width: contentWidth(),
      lineGap: 2,
    });
}

function renderBullet(text) {
  ensureSpace(22);
  const y = doc.y + 4;
  doc.circle(PAGE.margin + 4, y, 2).fill(COLORS.signal);
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.text)
    .text(cleanInline(text), PAGE.margin + 16, doc.y, {
      width: contentWidth() - 16,
      lineGap: 2,
    });
}

function renderNumbered(number, text) {
  ensureSpace(24);
  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .fillColor(COLORS.signal)
    .text(`${number}.`, PAGE.margin, doc.y, { width: 22, continued: false });

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.text)
    .text(cleanInline(text), PAGE.margin + 24, doc.y - 12, {
      width: contentWidth() - 24,
      lineGap: 2,
    });
}

function renderTable(lines) {
  const rows = lines
    .filter((line) => !/^\|\s*-/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cleanInline(cell.trim())));

  if (rows.length === 0) return;

  const colCount = Math.max(...rows.map((row) => row.length));
  const widths = Array.from({ length: colCount }, () => contentWidth() / colCount);
  const rowHeight = 24;

  ensureSpace(rowHeight * rows.length + 14);
  const startX = PAGE.margin;
  let y = doc.y;

  rows.forEach((row, rowIndex) => {
    const fill = rowIndex === 0 ? "#e2e8f0" : rowIndex % 2 === 0 ? COLORS.soft : "#ffffff";
    doc.rect(startX, y, contentWidth(), rowHeight).fill(fill);

    row.forEach((cell, cellIndex) => {
      const x = startX + widths.slice(0, cellIndex).reduce((sum, width) => sum + width, 0);
      doc
        .font(rowIndex === 0 ? "Helvetica-Bold" : "Helvetica")
        .fontSize(8.2)
        .fillColor(COLORS.text)
        .text(cell, x + 7, y + 7, {
          width: widths[cellIndex] - 14,
          ellipsis: true,
        });
    });

    y += rowHeight;
  });

  doc.y = y + 8;
}

function renderImage(line) {
  const match = line.match(/src="([^"]+)"/);
  if (!match) return;

  const imagePath = path.resolve(docsDir, match[1]);
  if (!fs.existsSync(imagePath)) {
    drawSignalBox("ERROR", `No se encontró la imagen: ${match[1]}`);
    return;
  }

  if (!isSupportedImage(imagePath)) {
    drawSignalBox("IMAGEN", `La imagen ${path.basename(imagePath)} no tiene un formato compatible para incrustarse en PDF.`);
    return;
  }

  const width = 150;
  const x = PAGE.margin + (contentWidth() - width) / 2;
  ensureSpace(width + 38);

  doc
    .roundedRect(x - 12, doc.y - 6, width + 24, width + 12, 8)
    .fillAndStroke("#ffffff", COLORS.line);
  doc.image(imagePath, x, doc.y, { fit: [width, width], align: "center", valign: "center" });
  doc.y += width + 20;
}

function drawSignalBox(label, text) {
  const cleanText = cleanInline(text);
  const height = Math.max(34, doc.heightOfString(cleanText, { width: contentWidth() - 92 }) + 18);
  ensureSpace(height + 8);

  const y = doc.y;
  doc.roundedRect(PAGE.margin, y, contentWidth(), height, 6).fillAndStroke(COLORS.soft, COLORS.line);
  doc.roundedRect(PAGE.margin + 8, y + 8, 68, height - 16, 4).fill(COLORS.signal);
  doc
    .font("Helvetica-Bold")
    .fontSize(7.4)
    .fillColor("#ffffff")
    .text(label, PAGE.margin + 12, y + 14, { width: 60, align: "center" });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.text)
    .text(cleanText, PAGE.margin + 88, y + 10, {
      width: contentWidth() - 100,
      lineGap: 2,
    });

  doc.y = y + height + 8;
}

function renderPageNumbers() {
  const range = doc.bufferedPageRange();
  for (let index = range.start; index < range.start + range.count; index += 1) {
    doc.switchToPage(index);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        `Página ${index + 1} de ${range.count}`,
        PAGE.margin,
        doc.page.height - 34,
        { align: "right", width: contentWidth() },
      );
  }
}

function ensureSpace(height) {
  if (doc.y + height > doc.page.height - PAGE.bottom) {
    doc.addPage();
  }
}

function contentWidth() {
  return doc.page.width - PAGE.margin * 2;
}

function cleanInline(text) {
  return String(text)
    .replace(/<[^>]+>/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/&quot;/g, '"')
    .trim();
}

function isSupportedImage(imagePath) {
  if (!fs.existsSync(imagePath)) return false;
  const header = fs.readFileSync(imagePath).subarray(0, 12);
  const png = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const jpg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
  return png || jpg;
}
