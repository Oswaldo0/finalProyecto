import pool from "../database/mysqlPool.js";

export async function findActivas() {
  const [rows] = await pool.query(
    `SELECT c.id, c.nombre, c.codigo, f.nombre AS facultad_nombre
     FROM carreras c
     JOIN facultades f ON c.facultad_id = f.id
     WHERE c.estado = 'ACTIVA'
     ORDER BY f.nombre, c.nombre`
  );
  return rows;
}
