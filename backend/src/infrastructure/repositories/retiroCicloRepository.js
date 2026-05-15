import pool from "../database/mysqlPool.js";

export async function findAll({ page = 1, limit = 20, estado } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";

  if (estado) {
    where = "WHERE r.estado = ?";
    params.push(estado);
  }

  const [rows] = await pool.query(
    `SELECT r.ID AS id,
            CONCAT('RET-', YEAR(r.FECHA), '-', LPAD(r.ID, 4, '0')) AS correlativo,
            r.EXPEDIENTE AS expediente, r.CARNET AS carnet,
            r.ALUMNO_NOMBRE AS alumno_nombre, r.CARRERA_NOMBRE AS carrera_nombre,
            r.CICLO_A_RETIRAR AS ciclo_a_retirar, r.FECHA AS fecha,
            r.ESTADO AS estado, r.CREATED_AT AS created_at
     FROM retiros_ciclo r
     ${where}
     ORDER BY r.CREATED_AT DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM retiros_ciclo r ${where}`,
    params
  );

  return { data: rows, total, page, limit };
}

export async function findById(id) {
  const [[retiro]] = await pool.query(
    `SELECT r.ID AS id,
            CONCAT('RET-', YEAR(r.FECHA), '-', LPAD(r.ID, 4, '0')) AS correlativo,
            r.ESTUDIANTE_ID AS estudiante_id, r.CARRERA_ID AS carrera_id,
            r.USUARIO_ID AS usuario_id,
            r.EXPEDIENTE AS expediente, r.CARNET AS carnet, r.FECHA AS fecha,
            r.ALUMNO_NOMBRE AS alumno_nombre, r.CARRERA_NOMBRE AS carrera_nombre,
            r.CICLO_A_RETIRAR AS ciclo_a_retirar,
            r.ARTICULO_REFERENCIA AS articulo_referencia,
            r.TEXTO_RESOLUCION AS texto_resolucion,
            r.OBSERVACION_FINAL AS observacion_final,
            r.DECANO_NOMBRE AS decano_nombre, r.FACULTAD_NOMBRE AS facultad_nombre,
            r.ESTADO AS estado, r.CREATED_AT AS created_at, r.UPDATED_AT AS updated_at
     FROM retiros_ciclo r
     WHERE r.ID = ?`,
    [id]
  );

  if (!retiro) return null;

  const [asignaturas] = await pool.query(
    `SELECT ID AS id, ORDEN AS orden,
            ASIGNATURA_NOMBRE AS asignatura_nombre, UV AS uv
     FROM retiro_ciclo_asignaturas
     WHERE RETIRO_CICLO_ID = ?
     ORDER BY ORDEN`,
    [id]
  );

  return { ...retiro, asignaturas };
}

export async function create({ retiro, asignaturas = [] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO retiros_ciclo
        (estudiante_id, carrera_id, usuario_id,
         expediente, carnet, fecha,
         alumno_nombre, carrera_nombre,
         ciclo_a_retirar, articulo_referencia,
         texto_resolucion, observacion_final,
         decano_nombre, facultad_nombre, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        retiro.estudiante_id ?? null,
        retiro.carrera_id ?? null,
        retiro.usuario_id ?? null,
        retiro.expediente,
        retiro.carnet,
        retiro.fecha,
        retiro.alumno_nombre,
        retiro.carrera_nombre,
        retiro.ciclo_a_retirar,
        retiro.articulo_referencia ?? null,
        retiro.texto_resolucion,
        retiro.observacion_final ?? null,
        retiro.decano_nombre,
        retiro.facultad_nombre,
        retiro.estado ?? "BORRADOR",
      ]
    );

    const retiroId = result.insertId;

    if (asignaturas.length > 0) {
      const values = asignaturas.map((a, i) => [
        retiroId,
        i + 1,
        a.asignatura_nombre,
        a.uv ?? null,
      ]);
      await conn.query(
        `INSERT INTO retiro_ciclo_asignaturas (retiro_ciclo_id, orden, asignatura_nombre, uv) VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return findById(retiroId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, { retiro, asignaturas }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE retiros_ciclo SET
        expediente = ?, carnet = ?, fecha = ?,
        alumno_nombre = ?, carrera_nombre = ?,
        ciclo_a_retirar = ?, articulo_referencia = ?,
        texto_resolucion = ?, observacion_final = ?,
        decano_nombre = ?, facultad_nombre = ?,
        estado = ?, estudiante_id = ?, carrera_id = ?
       WHERE id = ?`,
      [
        retiro.expediente,
        retiro.carnet,
        retiro.fecha,
        retiro.alumno_nombre,
        retiro.carrera_nombre,
        retiro.ciclo_a_retirar,
        retiro.articulo_referencia ?? null,
        retiro.texto_resolucion,
        retiro.observacion_final ?? null,
        retiro.decano_nombre,
        retiro.facultad_nombre,
        retiro.estado ?? "BORRADOR",
        retiro.estudiante_id ?? null,
        retiro.carrera_id ?? null,
        id,
      ]
    );

    if (asignaturas !== undefined) {
      await conn.query(
        `DELETE FROM retiro_ciclo_asignaturas WHERE retiro_ciclo_id = ?`,
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
          `INSERT INTO retiro_ciclo_asignaturas (retiro_ciclo_id, orden, asignatura_nombre, uv) VALUES ?`,
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
    `DELETE FROM retiros_ciclo WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}
