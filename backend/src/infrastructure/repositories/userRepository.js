import { getDatabasePool } from "../database/mysql.js";

function toNullable(value) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

export async function getUserFormOptions() {
  const pool = getDatabasePool();
  const [[departamentos], [municipios]] = await Promise.all([
    pool.query(`SELECT ID AS id, DEPARTAMENTO AS nombre FROM departamentos ORDER BY DEPARTAMENTO`),
    pool.query(`SELECT ID AS id, NOMBRE AS nombre, ID_DEPA AS id_departamento FROM municipios ORDER BY NOMBRE`),
  ]);
  return { departamentos, municipios };
}

export async function createUser(payload) {
  const required = ["username", "password", "nombre", "apellido"];
  const missing = required.filter((f) => !payload[f]);
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(", ")}`);
  }

  const pool = getDatabasePool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let dirId = null;
    if (payload.id_departamento && payload.id_municipio) {
      const [dirResult] = await connection.query(
        `INSERT INTO direccion (DIRECCION, ID_DEPAR, ID_MUNI) VALUES (?, ?, ?)`,
        [
          toNullable(payload.direccion),
          Number(payload.id_departamento),
          Number(payload.id_municipio),
        ],
      );
      dirId = dirResult.insertId;
    }

    const [personaResult] = await connection.query(
      `INSERT INTO persona (NOMBRE, APELLIDO, CORREO, TELEFONO, ID_DIR, ESTADO)
       VALUES (?, ?, ?, ?, ?, 'ACTIVO')`,
      [
        toNullable(payload.nombre),
        toNullable(payload.apellido),
        toNullable(payload.correo),
        toNullable(payload.telefono),
        dirId !== null ? String(dirId) : null,
      ],
    );

    const personaId = personaResult.insertId;

    await connection.query(
      `INSERT INTO usuario (USERNAME, PASSWORD_USER, ESTADO, ID_PERSO)
       VALUES (?, ?, 'ACTIVO', ?)`,
      [payload.username, payload.password, personaId],
    );

    await connection.commit();

    return getUserByUsername(payload.username, connection);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUserByUsername(username, existingPool) {
  const pool = existingPool || getDatabasePool();
  const [rows] = await pool.query(
    `SELECT
       u.ID        AS id,
       u.USERNAME  AS username,
       u.ESTADO    AS estado,
       u.ULT_LOG   AS ult_log,
       p.NOMBRE    AS nombre,
       p.APELLIDO  AS apellido,
       p.CORREO    AS correo,
       p.TELEFONO  AS telefono
     FROM usuario u
     JOIN persona p ON p.ID = u.ID_PERSO
     WHERE u.USERNAME = ?
     LIMIT 1`,
    [username],
  );
  return rows[0] || null;
}

export async function getUsersWithSchema(limit = 50) {
  const pool = getDatabasePool();
  const [rows] = await pool.query(
    `SELECT
       u.ID        AS id,
       u.USERNAME  AS username,
       u.ESTADO    AS estado,
       u.ULT_LOG   AS ult_log,
       p.NOMBRE    AS nombre,
       p.APELLIDO  AS apellido,
       p.CORREO    AS correo,
       p.TELEFONO  AS telefono
     FROM usuario u
     JOIN persona p ON p.ID = u.ID_PERSO
     ORDER BY u.ID DESC
     LIMIT ?`,
    [Number(limit)],
  );

  return {
    columns: ["id", "username", "nombre", "apellido", "correo", "telefono", "estado", "ult_log"],
    rows,
  };
}
