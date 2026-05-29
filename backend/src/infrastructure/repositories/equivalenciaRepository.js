import pool from "../database/mysqlPool.js";

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

  return { data: rows, total, page, limit };
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

  return { ...equivalencia, detalles };
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
        equivalencia.fecha_solicitud ?? null,
        equivalencia.alumno_nombre,
        equivalencia.carreras_cursadas ?? null,
        equivalencia.carrera_destino ?? null,
        equivalencia.texto_solicitud,
        equivalencia.notas_universidad ?? null,
        equivalencia.decano_nombre ?? null,
        equivalencia.fecha_decano ?? null,
        equivalencia.alumno_nombre_firma ?? null,
        equivalencia.estado ?? "BORRADOR",
      ],
    );

    const equivalenciaId = result.insertId;

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