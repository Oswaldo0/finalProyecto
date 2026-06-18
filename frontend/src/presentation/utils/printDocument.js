import logoUrl from "../../assets/images/LOGO_USO.png";

export function getPrintLogoUrl() {
  return window.location.origin + logoUrl;
}

export function buildUniversityPrintHtml({ title, documentTitle, body, styles = "" }) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Georgia, "Times New Roman", serif; color: #111; background: #fff; padding: 24px; }
        .header { display: flex; align-items: center; justify-content: center; padding: 20px 0; }
        .header img { height: 72px; }
        .title { text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.04em; }
        .details { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 12px; }
        .details td { padding: 6px 4px; vertical-align: top; }
        .table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
        .table th, .table td { border: 1px solid #999; padding: 6px 8px; text-align: left; vertical-align: top; }
        .table th { background: #f3f4f6; }
        .text-block { text-align: justify; line-height: 1.7; margin-bottom: 12px; font-size: 12px; }
        .signature { margin-top: 50px; font-size: 12px; }
        .signature-line { width: 260px; border-top: 1px solid #333; margin-bottom: 6px; }
        .footer { margin-top: 40px; font-size: 10px; color: #555; }
        @media print { body { padding: 0; } }
        ${styles}
      </style>
    </head>
    <body>
      <div class="header"><img src="${getPrintLogoUrl()}" alt="Logo USO" /></div>
      <div class="title">${documentTitle}</div>
      ${body}
    </body>
    </html>
  `;
}

export function openPrintWindow({ title, documentTitle, body, styles }) {
  const ventana = window.open("", "_blank", "width=900,height=900");
  ventana.document.write(buildUniversityPrintHtml({ title, documentTitle, body, styles }));
  ventana.document.close();
  ventana.focus();
  setTimeout(() => ventana.print(), 400);
}
