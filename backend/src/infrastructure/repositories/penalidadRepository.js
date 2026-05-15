import pool from "../database/mysqlPool.js";

export async function findAll({ page = 1, limit = 20, estado } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";

  if (estado) {
    where = "WHERE p.estado = ?";
    params.push(estado);
  }

  const [rows] = await pool.query(
    `SELECT p.id,
            CONCAT('PEN-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS correlativo,
            p.alumno_nombre, p.carrera_nombre, p.fecha,
            p.ciclo_reingreso, p.estado, p.created_at
     FROM penalidades p
     ${where}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM penalidades p ${where}`,
    params
  );

  return { data: rows, total, page, limit };
}

export async function findById(id) {
  const [[penalidad]] = await pool.query(
    `SELECT p.id,
            CONCAT('PEN-', YEAR(p.fecha), '-', LPAD(p.id, 4, '0')) AS correlativo,
            p.estudiante_id, p.carrera_id, p.usuario_id,
            p.secretario_nombre, p.decano_nombre,
            p.fecha, p.cantidad_anios_egreso, p.ciclo_reingreso,
            p.alumno_nombre, p.carrera_nombre,
            p.mes_egreso, p.anio_egreso, p.anios_egresado,
            p.estado, p.created_at, p.updated_at
     FROM penalidades p
     WHERE p.id = ?`,
    [id]
  );

  if (!penalidad) return null;

  const [asignaturas] = await pool.query(
    `SELECT id, orden, asignatura_nombre, uv
     FROM penalidad_asignaturas
     WHERE penalidad_id = ?
     ORDER BY orden`,
    [id]
  );

  return { ...penalidad, asignaturas };
}

export async function create({ penalidad, asignaturas = [] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO penalidades
        (estudiante_id, carrera_id, usuario_id, secretario_nombre, decano_nombre,
         fecha, cantidad_anios_egreso, ciclo_reingreso, alumno_nombre,
         carrera_nombre, mes_egreso, anio_egreso, anios_egresado, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        penalidad.estudiante_id ?? null,
        penalidad.carrera_id ?? null,
        penalidad.usuario_id ?? null,
        penalidad.secretario_nombre,
        penalidad.decano_nombre,
        penalidad.fecha,
        penalidad.cantidad_anios_egreso,
        penalidad.ciclo_reingreso,
        penalidad.alumno_nombre,
        penalidad.carrera_nombre,
        penalidad.mes_egreso,
        penalidad.anio_egreso,
        penalidad.anios_egresado,
        penalidad.estado ?? "BORRADOR",
      ]
    );

    const penalidadId = result.insertId;

    if (asignaturas.length > 0) {
      const values = asignaturas.map((a, i) => [
        penalidadId,
        i + 1,
        a.asignatura_nombre,
        a.uv ?? null,
      ]);
      await conn.query(
        `INSERT INTO penalidad_asignaturas (penalidad_id, orden, asignatura_nombre, uv) VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return findById(penalidadId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, { penalidad, asignaturas }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE penalidades SET
        secretario_nombre = ?, decano_nombre = ?, fecha = ?,
        cantidad_anios_egreso = ?, ciclo_reingreso = ?,
        alumno_nombre = ?, carrera_nombre = ?,
        mes_egreso = ?, anio_egreso = ?, anios_egresado = ?,
        estado = ?, estudiante_id = ?, carrera_id = ?
       WHERE id = ?`,
      [
        penalidad.secretario_nombre,
        penalidad.decano_nombre,
        penalidad.fecha,
        penalidad.cantidad_anios_egreso,
        penalidad.ciclo_reingreso,
        penalidad.alumno_nombre,
        penalidad.carrera_nombre,
        penalidad.mes_egreso,
        penalidad.anio_egreso,
        penalidad.anios_egresado,
        penalidad.estado ?? "BORRADOR",
        penalidad.estudiante_id ?? null,
        penalidad.carrera_id ?? null,
        id,
      ]
    );

    if (asignaturas !== undefined) {
      await conn.query(
        `DELETE FROM penalidad_asignaturas WHERE penalidad_id = ?`,
        [id]
      );

      if (asignaturas.length > 0) {
        const values = asignaturas.map((a, i) => [
          id,
          i + 1,
          a.asignatura_nombre,
          a.uv ?? null,
        ]);
        await conn.query(
          `INSERT INTO penalidad_asignaturas (penalidad_id, orden, asignatura_nombre, uv) VALUES ?`,
          [values]
        );
      }
    }

    await conn.commit();
    return findById(id);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function remove(id) {
  const [result] = await pool.query(
    `DELETE FROM penalidades WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}
