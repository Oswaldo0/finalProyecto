import { getDatabasePool } from "../database/mysql.js";

const DIAS_SEMANA = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];

// --- Opciones de formulario ---------------------------------------------------
export async function getHorarioFormOptions() {
  const pool = getDatabasePool();

  const [grupos] = await pool.query(
    `SELECT g.ID AS id, g.NOMBRE AS nombre, m.NOMBRE AS materia, CONCAT(p.NOMBRE, ' ', p.APELLIDO) AS catedratico
     FROM grupo g
     LEFT JOIN materia m ON m.ID = g.ID_MATE
     LEFT JOIN catedratico c ON c.ID = g.ID_CATE
     LEFT JOIN persona p ON p.ID = c.ID_PERSO
     ORDER BY m.NOMBRE, g.NOMBRE`,
  );

  const [aulas] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre, CAPACIDAD AS capacidad FROM aula ORDER BY NOMBRE",
  );

  return { grupos, aulas, dias: DIAS_SEMANA };
}

// --- Crear horario ------------------------------------------------------------
export async function createHorario(payload) {
  const pool = getDatabasePool();

  const { id_grup, id_aula, dia, hora_inicio, hora_fin } = payload;

  if (!id_grup || !dia || !hora_inicio || !hora_fin) {
    throw new Error("Faltan campos obligatorios: grupo, día, hora inicio u hora fin.");
  }

  const horaIni = hora_inicio;
  const horaFin = hora_fin;

  if (horaIni >= horaFin) {
    throw new Error("La hora de inicio debe ser anterior a la hora de fin.");
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO horario (ID_GRUP, ID_AULA, DIA, HINICIO_, HFINAL_) VALUES (?, ?, ?, ?, ?)`,
      [
        Number(id_grup),
        id_aula ? Number(id_aula) : null,
        dia,
        horaIni,
        horaFin,
      ],
    );

    return {
      id: result.insertId,
      message: `Horario para el día "${dia}" creado exitosamente.`,
    };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Ya existe un horario con esos datos.");
    }
    throw error;
  }
}

// --- Listar horarios con detalle ---------------------------------------------
export async function getHorariosWithDetail() {
  const pool = getDatabasePool();

  const [rows] = await pool.query(
    `SELECT
       h.ID            AS id,
       h.DIA           AS dia,
       TIME_FORMAT(h.HINICIO_, '%H:%i') AS hora_inicio,
       TIME_FORMAT(h.HFINAL_,  '%H:%i') AS hora_fin,
       g.NOMBRE        AS grupo,
       m.NOMBRE        AS materia,
       a.NOMBRE        AS aula
     FROM horario h
     LEFT JOIN grupo   g ON g.ID  = h.ID_GRUP
     LEFT JOIN materia m ON m.ID  = g.ID_MATE
     LEFT JOIN aula    a ON a.ID  = h.ID_AULA
     ORDER BY
       FIELD(UPPER(h.DIA), 'LUNES','MARTES','MIERCOLES','MIÉRCOLES','JUEVES','VIERNES','SABADO','SÁBADO','DOMINGO'),
       h.HINICIO_ ASC`,
  );

  return rows;
}
