import pool from "../database/mysqlPool.js";

export async function buscar(q = "") {
  const term = `%${q}%`;
  const [rows] = await pool.query(
    `SELECT id, expediente, carnet, nombre_completo, email,
            carrera_actual_id, plan_estudio_id, estado
     FROM estudiantes
     WHERE (expediente LIKE ? OR carnet LIKE ? OR nombre_completo LIKE ?)
       AND estado = 'ACTIVO'
     LIMIT 20`,
    [term, term, term]
  );
  return rows;
}
