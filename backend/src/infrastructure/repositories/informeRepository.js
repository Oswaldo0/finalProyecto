import pool from "../database/mysqlPool.js";

export async function obtenerResumen({ fechaDesde = null, fechaHasta = null, tipoDocumento = "", estado = "" } = {}) {
  const [resultSets] = await pool.query("CALL sp_informe_documentos_resumen(?, ?, ?, ?)", [
    fechaDesde || null,
    fechaHasta || null,
    tipoDocumento || "",
    estado || "",
  ]);

  const [porTipo = [], porEstado = [], porPeriodo = [], documentos = []] = resultSets;
  const totalDocumentos = porTipo.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return {
    totalDocumentos,
    porTipo,
    porEstado,
    porPeriodo,
    documentos,
  };
}

export async function obtenerOpciones() {
  const [estados] = await pool.query(
    `SELECT DISTINCT estado
     FROM informe_documentos_resumen
     WHERE estado IS NOT NULL
     ORDER BY estado`,
  );

  const [carreras] = await pool.query(
    `SELECT carrera_nombre, COUNT(*) AS total
     FROM informe_documentos_resumen
     WHERE carrera_nombre IS NOT NULL AND carrera_nombre <> ''
     GROUP BY carrera_nombre
     ORDER BY total DESC, carrera_nombre
     LIMIT 20`,
  );

  return {
    tiposDocumento: ["PENALIDAD", "RETIRO_CICLO", "EQUIVALENCIA", "ABSORCION"],
    estados: estados.map((item) => item.estado),
    carreras,
  };
}
