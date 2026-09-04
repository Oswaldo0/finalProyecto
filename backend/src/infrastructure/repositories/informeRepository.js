import pool from "../database/mysqlPool.js";

const HIDE_HTTP_TEST_DATA = `
  NOT (
    LOWER(COALESCE(d.materia, '')) LIKE '%http%'
    OR LOWER(COALESCE(d.alumno_nombre, '')) LIKE '%http%'
    OR LOWER(COALESCE(d.carrera_nombre, '')) LIKE '%http%'
    OR LOWER(COALESCE(d.coordinador, '')) LIKE '%http%'
  )
`;

const DOCUMENT_UNION = `
  SELECT
    p.id,
    'penalidades' AS source_table,
    'PENALIDAD' AS tipo_documento,
    p.correlativo,
    p.fecha AS fecha_documento,
    p.estado,
    p.alumno_nombre,
    p.carrera_nombre,
    p.ciclo_reingreso AS ciclo,
    GROUP_CONCAT(pa.asignatura_nombre ORDER BY pa.orden SEPARATOR ', ') AS materia,
    p.secretario_nombre AS coordinador,
    p.created_at,
    p.updated_at
  FROM penalidades p
  LEFT JOIN penalidad_asignaturas pa ON pa.penalidad_id = p.id
  GROUP BY p.id

  UNION ALL

  SELECT
    r.id,
    'retiros_ciclo' AS source_table,
    'RETIRO_CICLO' AS tipo_documento,
    r.correlativo,
    r.fecha AS fecha_documento,
    r.estado,
    r.alumno_nombre,
    r.carrera_nombre,
    r.ciclo_a_retirar AS ciclo,
    GROUP_CONCAT(ra.asignatura_nombre ORDER BY ra.orden SEPARATOR ', ') AS materia,
    r.decano_nombre AS coordinador,
    r.created_at,
    r.updated_at
  FROM retiros_ciclo r
  LEFT JOIN retiro_ciclo_asignaturas ra ON ra.retiro_ciclo_id = r.id
  GROUP BY r.id

  UNION ALL

  SELECT
    e.id,
    'equivalencias' AS source_table,
    'EQUIVALENCIA' AS tipo_documento,
    e.correlativo,
    COALESCE(e.fecha_solicitud, DATE(e.created_at)) AS fecha_documento,
    e.estado,
    e.alumno_nombre,
    e.carrera_destino AS carrera_nombre,
    NULL AS ciclo,
    GROUP_CONCAT(CONCAT(ed.asignatura_cursada, ' / ', ed.asignatura_solicitada) ORDER BY ed.orden SEPARATOR ', ') AS materia,
    e.decano_nombre AS coordinador,
    e.created_at,
    e.updated_at
  FROM equivalencias e
  LEFT JOIN equivalencia_detalles ed ON ed.equivalencia_id = e.id
  GROUP BY e.id

  UNION ALL

  SELECT
    a.id,
    'absorciones' AS source_table,
    'ABSORCION' AS tipo_documento,
    a.correlativo,
    a.fecha AS fecha_documento,
    a.estado,
    TRIM(CONCAT(a.alumno_nombres, ' ', a.alumno_apellidos)) AS alumno_nombre,
    a.carrera_origen AS carrera_nombre,
    a.ciclo,
    CONCAT_WS(', ',
      GROUP_CONCAT(DISTINCT aa.asignatura_absorbida ORDER BY aa.orden SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT an.asignatura_nombre ORDER BY an.orden SEPARATOR ', '),
      GROUP_CONCAT(DISTINCT ar.asignatura_nombre ORDER BY ar.orden SEPARATOR ', ')
    ) AS materia,
    a.decano_nombre AS coordinador,
    a.created_at,
    a.updated_at
  FROM absorciones a
  LEFT JOIN absorcion_asignaturas_absorbidas aa ON aa.absorcion_id = a.id
  LEFT JOIN absorcion_asignaturas_no_existentes an ON an.absorcion_id = a.id
  LEFT JOIN absorcion_asignaturas_reprobadas ar ON ar.absorcion_id = a.id
  GROUP BY a.id

  UNION ALL

  SELECT
    c.id,
    'consultas_estudiantes' AS source_table,
    'CONSULTA' AS tipo_documento,
    c.correlativo,
    c.fecha_consulta AS fecha_documento,
    c.estado,
    TRIM(CONCAT(c.alumno_nombres, ' ', c.alumno_apellidos)) AS alumno_nombre,
    c.carrera_nombre,
    c.ciclo,
    c.materia_nombre AS materia,
    TRIM(CONCAT(c.coordinador_nombres, ' ', c.coordinador_apellidos)) AS coordinador,
    c.created_at,
    c.updated_at
  FROM consultas_estudiantes c

  UNION ALL

  SELECT
    n.id,
    'anotaciones' AS source_table,
    'ANOTACION' AS tipo_documento,
    n.correlativo,
    n.fecha AS fecha_documento,
    n.estado,
    n.docente AS alumno_nombre,
    n.facultad AS carrera_nombre,
    n.ciclo,
    n.asignatura_grupo AS materia,
    n.observador AS coordinador,
    n.created_at,
    n.updated_at
  FROM anotaciones n
`;

const MATERIA_UNION = `
  SELECT
    p.id,
    'penalidades' AS source_table,
    'PENALIDAD' AS tipo_documento,
    p.correlativo,
    p.fecha AS fecha_documento,
    p.estado,
    p.alumno_nombre,
    p.carrera_nombre,
    p.ciclo_reingreso AS ciclo,
    pa.asignatura_nombre AS materia,
    p.secretario_nombre AS coordinador,
    p.created_at,
    p.updated_at
  FROM penalidades p
  LEFT JOIN penalidad_asignaturas pa ON pa.penalidad_id = p.id

  UNION ALL

  SELECT
    r.id,
    'retiros_ciclo' AS source_table,
    'RETIRO_CICLO' AS tipo_documento,
    r.correlativo,
    r.fecha AS fecha_documento,
    r.estado,
    r.alumno_nombre,
    r.carrera_nombre,
    r.ciclo_a_retirar AS ciclo,
    ra.asignatura_nombre AS materia,
    r.decano_nombre AS coordinador,
    r.created_at,
    r.updated_at
  FROM retiros_ciclo r
  LEFT JOIN retiro_ciclo_asignaturas ra ON ra.retiro_ciclo_id = r.id

  UNION ALL

  SELECT
    e.id,
    'equivalencias' AS source_table,
    'EQUIVALENCIA' AS tipo_documento,
    e.correlativo,
    COALESCE(e.fecha_solicitud, DATE(e.created_at)) AS fecha_documento,
    e.estado,
    e.alumno_nombre,
    e.carrera_destino AS carrera_nombre,
    NULL AS ciclo,
    COALESCE(NULLIF(ed.asignatura_solicitada, ''), ed.asignatura_cursada) AS materia,
    e.decano_nombre AS coordinador,
    e.created_at,
    e.updated_at
  FROM equivalencias e
  LEFT JOIN equivalencia_detalles ed ON ed.equivalencia_id = e.id

  UNION ALL

  SELECT
    a.id,
    'absorciones' AS source_table,
    'ABSORCION' AS tipo_documento,
    a.correlativo,
    a.fecha AS fecha_documento,
    a.estado,
    TRIM(CONCAT(a.alumno_nombres, ' ', a.alumno_apellidos)) AS alumno_nombre,
    a.carrera_origen AS carrera_nombre,
    a.ciclo,
    aa.asignatura_absorbida AS materia,
    a.decano_nombre AS coordinador,
    a.created_at,
    a.updated_at
  FROM absorciones a
  LEFT JOIN absorcion_asignaturas_absorbidas aa ON aa.absorcion_id = a.id

  UNION ALL

  SELECT
    a.id,
    'absorciones' AS source_table,
    'ABSORCION' AS tipo_documento,
    a.correlativo,
    a.fecha AS fecha_documento,
    a.estado,
    TRIM(CONCAT(a.alumno_nombres, ' ', a.alumno_apellidos)) AS alumno_nombre,
    a.carrera_origen AS carrera_nombre,
    a.ciclo,
    an.asignatura_nombre AS materia,
    a.decano_nombre AS coordinador,
    a.created_at,
    a.updated_at
  FROM absorciones a
  LEFT JOIN absorcion_asignaturas_no_existentes an ON an.absorcion_id = a.id

  UNION ALL

  SELECT
    a.id,
    'absorciones' AS source_table,
    'ABSORCION' AS tipo_documento,
    a.correlativo,
    a.fecha AS fecha_documento,
    a.estado,
    TRIM(CONCAT(a.alumno_nombres, ' ', a.alumno_apellidos)) AS alumno_nombre,
    a.carrera_origen AS carrera_nombre,
    a.ciclo,
    ar.asignatura_nombre AS materia,
    a.decano_nombre AS coordinador,
    a.created_at,
    a.updated_at
  FROM absorciones a
  LEFT JOIN absorcion_asignaturas_reprobadas ar ON ar.absorcion_id = a.id

  UNION ALL

  SELECT
    c.id,
    'consultas_estudiantes' AS source_table,
    'CONSULTA' AS tipo_documento,
    c.correlativo,
    c.fecha_consulta AS fecha_documento,
    c.estado,
    TRIM(CONCAT(c.alumno_nombres, ' ', c.alumno_apellidos)) AS alumno_nombre,
    c.carrera_nombre,
    c.ciclo,
    c.materia_nombre AS materia,
    TRIM(CONCAT(c.coordinador_nombres, ' ', c.coordinador_apellidos)) AS coordinador,
    c.created_at,
    c.updated_at
  FROM consultas_estudiantes c

  UNION ALL

  SELECT
    n.id,
    'anotaciones' AS source_table,
    'ANOTACION' AS tipo_documento,
    n.correlativo,
    n.fecha AS fecha_documento,
    n.estado,
    n.docente AS alumno_nombre,
    n.facultad AS carrera_nombre,
    n.ciclo,
    n.asignatura_grupo AS materia,
    n.observador AS coordinador,
    n.created_at,
    n.updated_at
  FROM anotaciones n
`;

export async function obtenerResumen(filtros = {}) {
  const { where, params } = buildWhere(filtros);
  const fromDocuments = `FROM (${DOCUMENT_UNION}) d ${where}`;
  const fromMaterias = `FROM (${MATERIA_UNION}) d ${where}`;

  const [[porTipo], [porEstado], [porPeriodo], [porCiclo], [porMateria], [porCoordinador], [documentos]] = await Promise.all([
    pool.query(`
      SELECT tipo_documento, COUNT(*) AS total
      ${fromDocuments}
      GROUP BY tipo_documento
      ORDER BY total DESC, tipo_documento
    `, params),
    pool.query(`
      SELECT estado, COUNT(*) AS total
      ${fromDocuments}
      GROUP BY estado
      ORDER BY total DESC, estado
    `, params),
    pool.query(`
      SELECT DATE_FORMAT(fecha_documento, '%Y-%m') AS periodo, COUNT(*) AS total
      ${fromDocuments}
      WHERE_APPEND fecha_documento IS NOT NULL
      GROUP BY DATE_FORMAT(fecha_documento, '%Y-%m')
      ORDER BY periodo
    `.replace("WHERE_APPEND", where ? "AND" : "WHERE"), params),
    pool.query(`
      SELECT COALESCE(ciclo, 'SIN CICLO') AS ciclo, COUNT(*) AS total
      ${fromDocuments}
      GROUP BY COALESCE(ciclo, 'SIN CICLO')
      ORDER BY total DESC, ciclo
      LIMIT 12
    `, params),
    pool.query(`
      SELECT LOWER(TRIM(materia)) AS materia, COUNT(DISTINCT CONCAT(source_table, '#', id)) AS total
      ${fromMaterias}
        AND materia IS NOT NULL AND TRIM(materia) <> ''
      GROUP BY LOWER(TRIM(materia))
      ORDER BY total DESC, materia
      LIMIT 12
    `, params),
    pool.query(`
      SELECT COALESCE(NULLIF(coordinador, ''), 'SIN COORDINADOR') AS coordinador, COUNT(*) AS total
      ${fromDocuments}
      GROUP BY COALESCE(NULLIF(coordinador, ''), 'SIN COORDINADOR')
      ORDER BY total DESC, coordinador
      LIMIT 12
    `, params),
    pool.query(`
      SELECT id, source_table, tipo_documento, correlativo, fecha_documento, estado,
             alumno_nombre, carrera_nombre, ciclo, materia, coordinador
      ${fromDocuments}
      ORDER BY fecha_documento DESC, id DESC
      LIMIT 300
    `, params),
  ]);

  const totalDocumentos = porTipo.reduce((sum, item) => sum + Number(item.total || 0), 0);

  return {
    totalDocumentos,
    porTipo,
    porEstado,
    porPeriodo,
    porCiclo,
    porMateria,
    porCoordinador,
    documentos,
  };
}

export async function obtenerOpciones() {
  const fromDocuments = `FROM (${DOCUMENT_UNION}) d`;
  const fromMaterias = `FROM (${MATERIA_UNION}) d`;
  const [[anios], [ciclos], [materias], [coordinadores], [estados], [carreras]] = await Promise.all([
    pool.query(`
      SELECT DISTINCT YEAR(fecha_documento) AS anio
      ${fromDocuments}
      WHERE ${HIDE_HTTP_TEST_DATA}
        AND fecha_documento IS NOT NULL
      ORDER BY anio DESC
    `),
    pool.query(`
      SELECT DISTINCT ciclo
      ${fromDocuments}
      WHERE ${HIDE_HTTP_TEST_DATA}
        AND ciclo IS NOT NULL AND ciclo <> ''
      ORDER BY ciclo
    `),
    pool.query(`
      SELECT LOWER(TRIM(materia)) AS materia, COUNT(DISTINCT CONCAT(source_table, '#', id)) AS total
      ${fromMaterias}
      WHERE ${HIDE_HTTP_TEST_DATA}
        AND materia IS NOT NULL AND TRIM(materia) <> ''
      GROUP BY LOWER(TRIM(materia))
      ORDER BY total DESC, materia
      LIMIT 40
    `),
    pool.query(`
      SELECT coordinador, COUNT(*) AS total
      ${fromDocuments}
      WHERE ${HIDE_HTTP_TEST_DATA}
        AND coordinador IS NOT NULL AND coordinador <> ''
      GROUP BY coordinador
      ORDER BY total DESC, coordinador
      LIMIT 40
    `),
    pool.query(`
      SELECT DISTINCT estado
      ${fromDocuments}
      WHERE ${HIDE_HTTP_TEST_DATA}
        AND estado IS NOT NULL
      ORDER BY estado
    `),
    pool.query(`
      SELECT carrera_nombre, COUNT(*) AS total
      ${fromDocuments}
      WHERE ${HIDE_HTTP_TEST_DATA}
        AND carrera_nombre IS NOT NULL AND carrera_nombre <> ''
      GROUP BY carrera_nombre
      ORDER BY total DESC, carrera_nombre
      LIMIT 20
    `),
  ]);

  return {
    tiposDocumento: ["PENALIDAD", "RETIRO_CICLO", "EQUIVALENCIA", "ABSORCION", "CONSULTA", "ANOTACION"],
    anios: anios.map((item) => String(item.anio)),
    ciclos: ciclos.map((item) => item.ciclo),
    materias: materias.map((item) => item.materia),
    coordinadores: coordinadores.map((item) => item.coordinador),
    estados: estados.map((item) => item.estado),
    carreras,
  };
}

function buildWhere({
  fechaDesde = null,
  fechaHasta = null,
  anio = "",
  ciclo = "",
  materia = "",
  tipoDocumento = "",
  coordinador = "",
  estado = "",
} = {}) {
  const conditions = [HIDE_HTTP_TEST_DATA];
  const params = [];

  if (fechaDesde) {
    conditions.push("d.fecha_documento >= ?");
    params.push(fechaDesde);
  }

  if (fechaHasta) {
    conditions.push("d.fecha_documento <= ?");
    params.push(fechaHasta);
  }

  if (anio) {
    conditions.push("YEAR(d.fecha_documento) = ?");
    params.push(Number(anio));
  }

  if (ciclo) {
    conditions.push("d.ciclo = ?");
    params.push(ciclo);
  }

  if (materia) {
    conditions.push("d.materia LIKE ?");
    params.push(`%${materia}%`);
  }

  if (tipoDocumento) {
    conditions.push("d.tipo_documento = ?");
    params.push(tipoDocumento);
  }

  if (coordinador) {
    conditions.push("d.coordinador = ?");
    params.push(coordinador);
  }

  if (estado) {
    conditions.push("d.estado = ?");
    params.push(estado);
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}
