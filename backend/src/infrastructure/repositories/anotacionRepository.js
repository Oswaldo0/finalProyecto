import pool from "../database/mysqlPool.js";

function buildCorrelativo(id) {
  return `OBS-${String(id).padStart(4, "0")}`;
}

export async function findAll({ page = 1, limit = 20, estado } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";

  if (estado) {
    where = "WHERE estado = ?";
    params.push(estado);
  }

  const [rows] = await pool.query(
    `SELECT id, correlativo, observador, fecha, hora_inicio, hora_fin,
            asignatura_grupo, facultad, horario, docente, aula, ciclo,
            observaciones, estado, created_at, updated_at
     FROM anotaciones
     ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM anotaciones ${where}`,
    params,
  );

  return { data: rows, total, page, limit };
}

export async function findById(id) {
  const [[row]] = await pool.query(
    `SELECT id, correlativo, usuario_id, observador, fecha, hora_inicio, hora_fin,
            asignatura_grupo, facultad, horario, docente, aula, ciclo,
            observaciones, estado, created_at, updated_at
     FROM anotaciones
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return row ?? null;
}

export async function create(anotacion) {
  const [result] = await pool.query(
    `INSERT INTO anotaciones
      (usuario_id, observador, fecha, hora_inicio, hora_fin, asignatura_grupo,
       facultad, horario, docente, aula, ciclo, observaciones, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      anotacion.usuario_id ?? null,
      anotacion.observador,
      anotacion.fecha,
      anotacion.hora_inicio,
      anotacion.hora_fin,
      anotacion.asignatura_grupo,
      anotacion.facultad,
      anotacion.horario,
      anotacion.docente,
      anotacion.aula,
      anotacion.ciclo,
      anotacion.observaciones,
      anotacion.estado ?? "BORRADOR",
    ],
  );

  await pool.query(`UPDATE anotaciones SET correlativo = ? WHERE id = ?`, [
    buildCorrelativo(result.insertId),
    result.insertId,
  ]);

  return findById(result.insertId);
}

export async function update(id, anotacion) {
  await pool.query(
    `UPDATE anotaciones SET
       observador = ?, fecha = ?, hora_inicio = ?, hora_fin = ?,
       asignatura_grupo = ?, facultad = ?, horario = ?, docente = ?,
       aula = ?, ciclo = ?, observaciones = ?, estado = ?
     WHERE id = ?`,
    [
      anotacion.observador,
      anotacion.fecha,
      anotacion.hora_inicio,
      anotacion.hora_fin,
      anotacion.asignatura_grupo,
      anotacion.facultad,
      anotacion.horario,
      anotacion.docente,
      anotacion.aula,
      anotacion.ciclo,
      anotacion.observaciones,
      anotacion.estado ?? "BORRADOR",
      id,
    ],
  );

  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.query(`DELETE FROM anotaciones WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

export async function findCatalogos() {
  const [rows] = await pool.query(
    `SELECT tipo, valor
     FROM anotaciones_catalogos
     WHERE estado = 'ACTIVO'
     ORDER BY tipo, valor`,
  );

  return rows.reduce(
    (catalogos, row) => ({
      ...catalogos,
      [row.tipo]: [...catalogos[row.tipo], row.valor],
    }),
    { observadores: [], facultades: [], horarios: [] },
  );
}

export async function replaceCatalogos(catalogos) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE anotaciones_catalogos SET estado = 'INACTIVO'`);

    const rows = Object.entries(catalogos).flatMap(([tipo, valores]) =>
      valores.map((valor) => [tipo, valor]),
    );

    if (rows.length > 0) {
      await conn.query(
        `INSERT INTO anotaciones_catalogos (tipo, valor, estado)
         VALUES ?
         ON DUPLICATE KEY UPDATE estado = 'ACTIVO'`,
        [rows.map(([tipo, valor]) => [tipo, valor, "ACTIVO"])],
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return findCatalogos();
}
