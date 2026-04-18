import { getDatabasePool } from "../database/mysql.js";
const studentSelect = `
  SELECT
    e.EXPEDIENTE   AS expediente,
    p.NOMBRE       AS nombre,
    p.APELLIDO     AS apellido,
    e.CUM          AS cum,
    e.CALIDAD      AS calidad,
    e.YEAR_INGRESO AS year_ingreso,
    pe.NOMBRE      AS plan_estudio,
    c.NOMBRE       AS carrera,
    f.NOMBRE       AS facultad,
    d.DIRECCION    AS direccion,
    dep.DEPARTAMENTO AS departamento,
    m.NOMBRE       AS municipio,
    p.TELEFONO     AS telefono,
    p.CORREO       AS correo,
    e.ESTADO       AS estado
  FROM estudiante e
  JOIN  persona       p  ON p.ID  = e.ID_PERSO
  LEFT JOIN plan_estudio pe ON pe.ID = e.ID_PLES
  LEFT JOIN carrera       c  ON c.ID  = pe.ID_CARRE
  LEFT JOIN facultad      f  ON f.ID  = c.ID_FACU
  LEFT JOIN direccion     d  ON d.ID  = p.ID_DIR
  LEFT JOIN departamentos dep ON dep.ID = d.ID_DEPAR
  LEFT JOIN municipios    m  ON m.ID  = d.ID_MUNI
`;

const studentColumns = [
  "expediente",
  "nombre",
  "apellido",
  "cum",
  "calidad",
  "year_ingreso",
  "plan_estudio",
  "carrera",
  "facultad",
  "telefono",
  "correo",
  "direccion",
  "departamento",
  "municipio",
  "estado",
];

function toNullable(value) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  return Number(value);
}

function validateCum(value) {
  if (value === undefined || value === null || value === "") return;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) throw new Error("El campo cum debe ser numerico.");
  if (parsed < 0) throw new Error("El campo cum no permite valores negativos.");
}

export async function getStudentsWithSchema(limit = 50) {
  const pool = getDatabasePool();
  const [rows] = await pool.query(
    `${studentSelect} ORDER BY e.EXPEDIENTE LIMIT ?`,
    [Number(limit)],
  );
  return { table: "estudiante", columns: studentColumns, rows };
}

export async function getStudentByExpediente(expediente) {
  const pool = getDatabasePool();
  const [rows] = await pool.query(
    `${studentSelect} WHERE e.EXPEDIENTE = ? LIMIT 1`,
    [expediente],
  );
  return rows[0] || null;
}

export async function getEditableStudentByExpediente(expediente) {
  const pool = getDatabasePool();
  const [rows] = await pool.query(
    `SELECT
       e.EXPEDIENTE   AS expediente,
       p.NOMBRE       AS nombre,
       p.APELLIDO     AS apellido,
       e.CUM          AS cum,
       e.CALIDAD      AS calidad,
       e.YEAR_INGRESO AS year_ingreso,
       e.ID_PLES      AS id_plan_estu,
       p.TELEFONO     AS telefono,
       p.CORREO       AS correo,
       p.ID_DIR       AS direccion,
       e.ESTADO       AS estado
     FROM estudiante e
     JOIN persona p ON p.ID = e.ID_PERSO
     WHERE e.EXPEDIENTE = ?
     LIMIT 1`,
    [expediente],
  );
  return rows[0] || null;
}

export async function getStudentFormOptions() {
  const pool = getDatabasePool();

  const [departamentos] = await pool.query(
    "SELECT ID AS id, DEPARTAMENTO AS nombre FROM departamentos ORDER BY DEPARTAMENTO",
  );
  const [municipios] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre, ID_DEPA AS id_departamento FROM municipios ORDER BY NOMBRE",
  );
  const [carreras] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre FROM carrera ORDER BY NOMBRE",
  );
  const [facultades] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre FROM facultad ORDER BY NOMBRE",
  );
  const [ciclos] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre FROM ciclo_academico ORDER BY NOMBRE",
  );
  const [planes] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre FROM plan_estudio ORDER BY NOMBRE",
  );

  return { departamentos, municipios, carreras, facultades, ciclos, planes };
}

export async function createStudent(payload) {
  const pool = getDatabasePool();

  const requiredFields = ["expediente", "nombre", "apellido"];
  const missing = requiredFields.filter((f) => !payload[f]);
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(", ")}`);
  }

  validateCum(payload.cum);

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
      `INSERT INTO persona (NOMBRE, APELLIDO, TELEFONO, CORREO, ID_DIR, ESTADO)
       VALUES (?, ?, ?, ?, ?, 'ACTIVO')`,
      [
        toNullable(payload.nombre),
        toNullable(payload.apellido),
        toNullable(payload.telefono),
        toNullable(payload.correo),
        dirId !== null ? String(dirId) : null,
      ],
    );

    const personaId = personaResult.insertId;

    await connection.query(
      `INSERT INTO estudiante (ID_PERSO, EXPEDIENTE, CUM, CALIDAD, YEAR_INGRESO, ID_PLES, ESTADO)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')`,
      [
        personaId,
        payload.expediente,
        toNullable(payload.cum),
        toNullable(payload.calidad),
        toNullableNumber(payload.year_ingreso) || new Date().getFullYear(),
        toNullableNumber(payload.id_plan_estu),
      ],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getStudentByExpediente(payload.expediente);
}

export async function updateStudent(expediente, payload) {
  validateCum(payload.cum);

  const pool = getDatabasePool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT ID, ID_PERSO FROM estudiante WHERE EXPEDIENTE = ? LIMIT 1",
      [expediente],
    );

    if (!existing[0]) throw new Error("Estudiante no encontrado.");

    const personaId = existing[0].ID_PERSO;

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

    await connection.query(
      `UPDATE persona SET NOMBRE=?, APELLIDO=?, TELEFONO=?, CORREO=?, ID_DIR=? WHERE ID=?`,
      [
        toNullable(payload.nombre),
        toNullable(payload.apellido),
        toNullable(payload.telefono),
        toNullable(payload.correo),
        dirId !== null ? String(dirId) : toNullable(payload.direccion),
        personaId,
      ],
    );

    await connection.query(
      `UPDATE estudiante SET CUM=?, CALIDAD=?, YEAR_INGRESO=?, ID_PLES=? WHERE EXPEDIENTE=?`,
      [
        toNullable(payload.cum),
        toNullable(payload.calidad),
        toNullableNumber(payload.year_ingreso),
        toNullableNumber(payload.id_plan_estu),
        expediente,
      ],
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getStudentByExpediente(expediente);
}

export async function deleteStudentByExpediente(expediente) {
  const pool = getDatabasePool();
  const [result] = await pool.query(
    `UPDATE estudiante
     SET ESTADO = 'INACTIVO'
     WHERE EXPEDIENTE = ? AND ESTADO <> 'INACTIVO'`,
    [expediente],
  );

  if (result.affectedRows === 0) {
    const [existing] = await pool.query(
      "SELECT ID, ESTADO FROM estudiante WHERE EXPEDIENTE = ? LIMIT 1",
      [expediente],
    );

    if (!existing[0]) {
      throw new Error("Estudiante no encontrado.");
    }

    throw new Error("El estudiante ya está inactivo.");
  }

  return getStudentByExpediente(expediente);
}
