import pool from "../database/mysqlPool.js";
import { dateOnly } from "./dateOnly.js";

function buildAbsorcionCorrelativo(fecha, id) {
  const year = new Date(fecha).getFullYear();
  return `ABS-${year}-${String(id).padStart(4, "0")}`;
}

export async function findAll({ page = 1, limit = 20, estado } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";

  if (estado) {
    where = "WHERE a.estado = ?";
    params.push(estado);
  }

  const [rows] = await pool.query(
    `SELECT a.id,
            a.correlativo,
            a.fecha,
            CONCAT(a.alumno_nombres, ' ', a.alumno_apellidos) AS alumno_nombre,
            a.carrera_origen,
            a.plan_solicitado,
            a.estado,
            a.created_at
     FROM absorciones a
     ${where}
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM absorciones a ${where}`,
    params,
  );

  return { data: rows.map(mapAbsorcion), total, page, limit };
}

export async function findById(id) {
  const [[absorcion]] = await pool.query(
    `SELECT a.id,
            a.correlativo,
            a.estudiante_id,
            a.facultad_id,
            a.usuario_id,
            a.facultad_nombre,
            a.ciclo,
            a.fecha,
            a.alumno_nombres,
            a.alumno_apellidos,
            a.carrera_origen,
            a.plan_origen,
            a.plan_solicitado,
            a.encabezado_dictamen,
            a.decano_nombre,
            a.facultad_firma_nombre,
            a.estado,
            a.created_at,
            a.updated_at
     FROM absorciones a
     WHERE a.id = ?`,
    [id],
  );

  if (!absorcion) return null;

  const [absorbidas] = await pool.query(
    `SELECT id, orden, asignatura_cursada, asignatura_absorbida, nota_asignada
     FROM absorcion_asignaturas_absorbidas
     WHERE absorcion_id = ?
     ORDER BY orden`,
    [id],
  );

  const [noExistentes] = await pool.query(
    `SELECT id, orden, asignatura_nombre, nota
     FROM absorcion_asignaturas_no_existentes
     WHERE absorcion_id = ?
     ORDER BY orden`,
    [id],
  );

  const [reprobadas] = await pool.query(
    `SELECT id, orden, asignatura_nombre, nota
     FROM absorcion_asignaturas_reprobadas
     WHERE absorcion_id = ?
     ORDER BY orden`,
    [id],
  );

  return { ...mapAbsorcion(absorcion), absorbidas, noExistentes, reprobadas };
}

export async function create({ absorcion, absorbidas = [], noExistentes = [], reprobadas = [] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO absorciones
        (estudiante_id, facultad_id, usuario_id, facultad_nombre, ciclo, fecha,
         alumno_nombres, alumno_apellidos, carrera_origen, plan_origen, plan_solicitado,
         encabezado_dictamen, decano_nombre, facultad_firma_nombre, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        absorcion.estudiante_id ?? null,
        absorcion.facultad_id ?? null,
        absorcion.usuario_id ?? null,
        absorcion.facultad_nombre,
        absorcion.ciclo,
        dateOnly(absorcion.fecha),
        absorcion.alumno_nombres,
        absorcion.alumno_apellidos,
        absorcion.carrera_origen,
        absorcion.plan_origen,
        absorcion.plan_solicitado,
        absorcion.encabezado_dictamen,
        absorcion.decano_nombre,
        absorcion.facultad_firma_nombre,
        absorcion.estado ?? "CREADO",
      ],
    );

    const absorcionId = result.insertId;
    const correlativo = buildAbsorcionCorrelativo(dateOnly(absorcion.fecha), absorcionId);
    await conn.query(
      `UPDATE absorciones SET correlativo = ? WHERE id = ?`,
      [correlativo, absorcionId],
    );

    if (absorbidas.length > 0) {
      const values = absorbidas.map((item, index) => [
        absorcionId,
        index + 1,
        item.asignatura_cursada,
        item.asignatura_absorbida,
        item.nota_asignada ?? null,
      ]);
      await conn.query(
        `INSERT INTO absorcion_asignaturas_absorbidas
          (absorcion_id, orden, asignatura_cursada, asignatura_absorbida, nota_asignada)
         VALUES ?`,
        [values],
      );
    }

    if (noExistentes.length > 0) {
      const values = noExistentes.map((item, index) => [
        absorcionId,
        index + 1,
        item.asignatura_nombre,
        item.nota ?? null,
      ]);
      await conn.query(
        `INSERT INTO absorcion_asignaturas_no_existentes
          (absorcion_id, orden, asignatura_nombre, nota)
         VALUES ?`,
        [values],
      );
    }

    if (reprobadas.length > 0) {
      const values = reprobadas.map((item, index) => [
        absorcionId,
        index + 1,
        item.asignatura_nombre,
        item.nota ?? null,
      ]);
      await conn.query(
        `INSERT INTO absorcion_asignaturas_reprobadas
          (absorcion_id, orden, asignatura_nombre, nota)
         VALUES ?`,
        [values],
      );
    }

    await conn.commit();
    return findById(absorcionId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, { absorcion, absorbidas = [], noExistentes = [], reprobadas = [] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE absorciones SET
         facultad_nombre = ?, ciclo = ?, fecha = ?,
         alumno_nombres = ?, alumno_apellidos = ?, carrera_origen = ?,
         plan_origen = ?, plan_solicitado = ?, encabezado_dictamen = ?,
         decano_nombre = ?, facultad_firma_nombre = ?, estado = ?,
         estudiante_id = ?, facultad_id = ?, usuario_id = ?
       WHERE id = ?`,
      [
        absorcion.facultad_nombre,
        absorcion.ciclo,
        dateOnly(absorcion.fecha),
        absorcion.alumno_nombres,
        absorcion.alumno_apellidos,
        absorcion.carrera_origen,
        absorcion.plan_origen,
        absorcion.plan_solicitado,
        absorcion.encabezado_dictamen,
        absorcion.decano_nombre,
        absorcion.facultad_firma_nombre,
        absorcion.estado ?? "CREADO",
        absorcion.estudiante_id ?? null,
        absorcion.facultad_id ?? null,
        absorcion.usuario_id ?? null,
        id,
      ],
    );
    const correlativo = buildAbsorcionCorrelativo(dateOnly(absorcion.fecha), id);
    await conn.query(`UPDATE absorciones SET correlativo = ? WHERE id = ?`, [correlativo, id]);

    await conn.query(`DELETE FROM absorcion_asignaturas_absorbidas WHERE absorcion_id = ?`, [id]);
    await conn.query(`DELETE FROM absorcion_asignaturas_no_existentes WHERE absorcion_id = ?`, [id]);
    await conn.query(`DELETE FROM absorcion_asignaturas_reprobadas WHERE absorcion_id = ?`, [id]);

    if (absorbidas.length > 0) {
      const values = absorbidas.map((item, index) => [
        id,
        index + 1,
        item.asignatura_cursada,
        item.asignatura_absorbida,
        item.nota_asignada ?? null,
      ]);
      await conn.query(
        `INSERT INTO absorcion_asignaturas_absorbidas
          (absorcion_id, orden, asignatura_cursada, asignatura_absorbida, nota_asignada)
         VALUES ?`,
        [values],
      );
    }

    if (noExistentes.length > 0) {
      const values = noExistentes.map((item, index) => [
        id,
        index + 1,
        item.asignatura_nombre,
        item.nota ?? null,
      ]);
      await conn.query(
        `INSERT INTO absorcion_asignaturas_no_existentes
          (absorcion_id, orden, asignatura_nombre, nota)
         VALUES ?`,
        [values],
      );
    }

    if (reprobadas.length > 0) {
      const values = reprobadas.map((item, index) => [
        id,
        index + 1,
        item.asignatura_nombre,
        item.nota ?? null,
      ]);
      await conn.query(
        `INSERT INTO absorcion_asignaturas_reprobadas
          (absorcion_id, orden, asignatura_nombre, nota)
         VALUES ?`,
        [values],
      );
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
  const [result] = await pool.query(`DELETE FROM absorciones WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

export async function markAsPrinted(id) {
  await pool.query(
    `UPDATE absorciones
     SET estado = 'IMPRESO'
     WHERE id = ? AND estado = 'CREADO'`,
    [id],
  );

  return findById(id);
}

function mapAbsorcion(row) {
  if (!row) return null;
  return { ...row, fecha: dateOnly(row.fecha) };
}
