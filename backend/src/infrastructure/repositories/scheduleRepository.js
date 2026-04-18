import { getDatabasePool } from "../database/mysql.js";

export async function getWeeklyScheduleRows() {
  const pool = getDatabasePool();
  const [rows] = await pool.query(
    `SELECT
       h.DIA AS dia,
       TIME_FORMAT(h.HINICIO_, '%H:%i') AS hora_inicio,
       TIME_FORMAT(h.HFINAL_, '%H:%i') AS hora_fin,
       g.NOMBRE AS grupo,
       m.NOMBRE AS clase,
       a.NOMBRE AS aula
     FROM horario h
     JOIN grupo g ON g.ID = h.ID_GRUP
     LEFT JOIN materia m ON m.ID = g.ID_MATE
     LEFT JOIN aula a ON a.ID = h.ID_AULA
     ORDER BY
       FIELD(UPPER(h.DIA), 'LUNES', 'MARTES', 'MIERCOLES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'SÁBADO', 'DOMINGO'),
       h.HINICIO_ ASC`,
  );
  return rows;
}
