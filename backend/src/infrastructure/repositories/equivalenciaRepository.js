import pool from "../database/mysqlPool.js";
import { dateOnly } from "./dateOnly.js";

function buildEquivalenciaCorrelativo(fechaSolicitud, createdAt, id) {
  if (!id) return null;
  const baseDate = fechaSolicitud || createdAt || new Date();
  const year = String(new Date(baseDate).getFullYear()).padStart(4, "0");
  return `EQ-${year}-${String(id).padStart(4, "0")}`;
}

export async function findAll({ page = 1, limit = 20, estado } = {}) {
  const offset = (page - 1) * limit;
  const params = [];
  let where = "";

  if (estado) {
    where = "WHERE e.estado = ?";
    params.push(estado);
  }

  const [rows] = await pool.query(
    `SELECT e.id,
            e.correlativo,
            e.fecha_solicitud,
            e.alumno_nombre,
            e.carrera_destino,
            e.estado,
            e.created_at
     FROM equivalencias e
     ${where}
     ORDER BY e.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM equivalencias e ${where}`,
    params,
  );

  return { data: rows.map(mapEquivalencia), total, page, limit };
}

export async function findById(id) {
  const [[equivalencia]] = await pool.query(
    `SELECT e.id,
            e.correlativo,
            e.estudiante_id,
            e.usuario_id,
            e.fecha_solicitud,
            e.alumno_nombre,
            e.carreras_cursadas,
            e.carrera_destino,
            e.texto_solicitud,
            e.notas_universidad,
            e.decano_nombre,
            e.fecha_decano,
            e.alumno_nombre_firma,
            e.estado,
            e.created_at,
            e.updated_at
     FROM equivalencias e
     WHERE e.id = ?`,
    [id],
  );

  if (!equivalencia) return null;

  const [detalles] = await pool.query(
    `SELECT d.id,
            d.orden,
            d.asignatura_cursada,
            d.uv,
            d.nota,
            d.institucion_nombre,
            d.asignatura_solicitada,
            d.resultado
     FROM equivalencia_detalles d
     WHERE d.equivalencia_id = ?
     ORDER BY d.orden`,
    [id],
  );

  return { ...mapEquivalencia(equivalencia), detalles };
}

export async function create({ equivalencia, detalles = [] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO equivalencias
        (estudiante_id, usuario_id, fecha_solicitud,
         alumno_nombre, carreras_cursadas, carrera_destino,
         texto_solicitud, notas_universidad,
         decano_nombre, fecha_decano, alumno_nombre_firma, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equivalencia.estudiante_id ?? null,
        equivalencia.usuario_id ?? null,
        dateOnly(equivalencia.fecha_solicitud) ?? null,
        equivalencia.alumno_nombre,
        equivalencia.carreras_cursadas ?? null,
        equivalencia.carrera_destino ?? null,
        equivalencia.texto_solicitud,
        equivalencia.notas_universidad ?? null,
        equivalencia.decano_nombre ?? null,
        dateOnly(equivalencia.fecha_decano) ?? null,
        equivalencia.alumno_nombre_firma ?? null,
        equivalencia.estado ?? "CREADO",
      ],
    );

    const equivalenciaId = result.insertId;
    const correlativo = buildEquivalenciaCorrelativo(dateOnly(equivalencia.fecha_solicitud), null, equivalenciaId);

    if (correlativo) {
      await conn.query(
        `UPDATE equivalencias SET correlativo = ? WHERE id = ?`,
        [correlativo, equivalenciaId],
      );
    }

    if (detalles.length > 0) {
      const values = detalles.map((d, i) => [
        equivalenciaId,
        i + 1,
        d.asignatura_cursada,
        d.uv ?? null,
        d.nota ?? null,
        d.institucion_nombre ?? null,
        d.asignatura_solicitada,
        d.resultado ?? "PENDIENTE",
      ]);
      await conn.query(
        `INSERT INTO equivalencia_detalles
          (equivalencia_id, orden, asignatura_cursada, uv, nota,
           institucion_nombre, asignatura_solicitada, resultado)
         VALUES ?`,
        [values],
      );
    }

    await conn.commit();
    return findById(equivalenciaId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function update(id, { equivalencia, detalles }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE equivalencias SET
         estudiante_id = ?, usuario_id = ?, fecha_solicitud = ?,
         alumno_nombre = ?, carreras_cursadas = ?, carrera_destino = ?,
         texto_solicitud = ?, notas_universidad = ?,
         decano_nombre = ?, fecha_decano = ?, alumno_nombre_firma = ?,
         estado = ?
       WHERE id = ?`,
      [
        equivalencia.estudiante_id ?? null,
        equivalencia.usuario_id ?? null,
        dateOnly(equivalencia.fecha_solicitud) ?? null,
        equivalencia.alumno_nombre,
        equivalencia.carreras_cursadas ?? null,
        equivalencia.carrera_destino ?? null,
        equivalencia.texto_solicitud,
        equivalencia.notas_universidad ?? null,
        equivalencia.decano_nombre ?? null,
        dateOnly(equivalencia.fecha_decano) ?? null,
        equivalencia.alumno_nombre_firma ?? null,
        equivalencia.estado ?? "CREADO",
        id,
      ],
    );

    const correlativo = buildEquivalenciaCorrelativo(dateOnly(equivalencia.fecha_solicitud), null, id);
    if (correlativo) {
      await conn.query(`UPDATE equivalencias SET correlativo = ? WHERE id = ?`, [correlativo, id]);
    }

    if (detalles !== undefined) {
      await conn.query(`DELETE FROM equivalencia_detalles WHERE equivalencia_id = ?`, [id]);

      if (detalles.length > 0) {
        const values = detalles.map((d, i) => [
          id,
          i + 1,
          d.asignatura_cursada,
          d.uv ?? null,
          d.nota ?? null,
          d.institucion_nombre ?? null,
          d.asignatura_solicitada,
          d.resultado ?? "PENDIENTE",
        ]);
        await conn.query(
          `INSERT INTO equivalencia_detalles
            (equivalencia_id, orden, asignatura_cursada, uv, nota,
             institucion_nombre, asignatura_solicitada, resultado)
           VALUES ?`,
          [values],
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
  const [result] = await pool.query(`DELETE FROM equivalencias WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

export async function markAsPrinted(id) {
  await pool.query(
    `UPDATE equivalencias
     SET estado = 'IMPRESO'
     WHERE id = ? AND estado = 'CREADO'`,
    [id],
  );

  return findById(id);
}

function mapEquivalencia(row) {
  if (!row) return null;
  return {
    ...row,
    fecha_solicitud: dateOnly(row.fecha_solicitud),
    fecha_decano: dateOnly(row.fecha_decano),
  };
}
