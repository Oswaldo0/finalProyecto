import pool from "../database/mysqlPool.js";
import { dateOnly } from "./dateOnly.js";

function buildCorrelativo(id) {
  return `CON-${String(id).padStart(4, "0")}`;
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
    `SELECT id, correlativo, tipo_consulta, coordinador_nombres, coordinador_apellidos,
            alumno_nombres, alumno_apellidos, fecha_consulta, ciclo, carrera_nombre,
            materia_nombre, consulta, respuesta, estado, created_at, updated_at
     FROM consultas_estudiantes
     ${where}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM consultas_estudiantes ${where}`,
    params,
  );

  return { data: rows.map(mapConsulta), total, page, limit };
}

export async function findById(id) {
  const [[row]] = await pool.query(
    `SELECT id, correlativo, usuario_id, tipo_consulta, coordinador_nombres,
            coordinador_apellidos, alumno_nombres, alumno_apellidos, fecha_consulta,
            ciclo, carrera_nombre, materia_nombre, consulta, respuesta, estado,
            created_at, updated_at
     FROM consultas_estudiantes
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return mapConsulta(row);
}

export async function create(consulta) {
  const [result] = await pool.query(
    `INSERT INTO consultas_estudiantes
      (usuario_id, tipo_consulta, coordinador_nombres, coordinador_apellidos,
       alumno_nombres, alumno_apellidos, fecha_consulta, ciclo, carrera_nombre,
       materia_nombre, consulta, respuesta, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      consulta.usuario_id ?? null,
      consulta.tipo_consulta,
      consulta.coordinador_nombres,
      consulta.coordinador_apellidos,
      consulta.alumno_nombres,
      consulta.alumno_apellidos,
      dateOnly(consulta.fecha_consulta),
      consulta.ciclo,
      consulta.carrera_nombre,
      consulta.materia_nombre || "SIN ASIGNAR",
      consulta.consulta,
      consulta.respuesta,
      consulta.estado ?? "CREADO",
    ],
  );

  await pool.query(`UPDATE consultas_estudiantes SET correlativo = ? WHERE id = ?`, [
    buildCorrelativo(result.insertId),
    result.insertId,
  ]);

  return findById(result.insertId);
}

export async function update(id, consulta) {
  await pool.query(
    `UPDATE consultas_estudiantes SET
       tipo_consulta = ?, coordinador_nombres = ?, coordinador_apellidos = ?,
       alumno_nombres = ?, alumno_apellidos = ?, fecha_consulta = ?, ciclo = ?,
       carrera_nombre = ?, materia_nombre = ?, consulta = ?, respuesta = ?,
       estado = ?
     WHERE id = ?`,
    [
      consulta.tipo_consulta,
      consulta.coordinador_nombres,
      consulta.coordinador_apellidos,
      consulta.alumno_nombres,
      consulta.alumno_apellidos,
      dateOnly(consulta.fecha_consulta),
      consulta.ciclo,
      consulta.carrera_nombre,
      consulta.materia_nombre || "SIN ASIGNAR",
      consulta.consulta,
      consulta.respuesta,
      consulta.estado ?? "CREADO",
      id,
    ],
  );

  return findById(id);
}

export async function markAsPrinted(id) {
  await pool.query(
    `UPDATE consultas_estudiantes
     SET estado = 'IMPRESO'
     WHERE id = ? AND estado = 'CREADO'`,
    [id],
  );

  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.query(`DELETE FROM consultas_estudiantes WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

function mapConsulta(row) {
  if (!row) return null;
  return { ...row, fecha_consulta: dateOnly(row.fecha_consulta) };
}
