import { getDatabasePool } from "../database/mysql.js";

const catedraticSelect = `
  SELECT
    c.ID             AS id,
    p.NOMBRE         AS nombre,
    p.APELLIDO       AS apellido,
    p.CORREO         AS correo,
    p.TELEFONO       AS telefono,
    f.NOMBRE         AS facultad,
    c.TIP_CONTRATO   AS tip_contrato,
    dep.DEPARTAMENTO AS departamento,
    m.NOMBRE         AS municipio,
    d.DIRECCION      AS direccion
  FROM catedratico c
  JOIN  persona       p   ON p.ID  = c.ID_PERSO
  LEFT JOIN facultad      f   ON f.ID  = c.ID_FACU
  LEFT JOIN direccion     d   ON d.ID  = p.ID_DIR
  LEFT JOIN departamentos dep ON dep.ID = d.ID_DEPAR
  LEFT JOIN municipios    m   ON m.ID  = d.ID_MUNI
`;

const catedraticColumns = [
  "id",
  "nombre",
  "apellido",
  "correo",
  "telefono",
  "facultad",
  "tip_contrato",
  "departamento",
  "municipio",
  "direccion",
];

function toNullable(value) {
  if (value === undefined || value === null || value === "") return null;
  return value;
}

export async function getCatedraticosWithSchema(limit = 50) {
  const pool = getDatabasePool();
  const [rows] = await pool.query(
    `${catedraticSelect} ORDER BY p.APELLIDO, p.NOMBRE LIMIT ?`,
    [Number(limit)],
  );
  return { table: "catedratico", columns: catedraticColumns, rows };
}

export async function getCatedraticFormOptions() {
  const pool = getDatabasePool();

  const [departamentos] = await pool.query(
    "SELECT ID AS id, DEPARTAMENTO AS nombre FROM departamentos ORDER BY DEPARTAMENTO",
  );
  const [municipios] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre, ID_DEPA AS id_departamento FROM municipios ORDER BY NOMBRE",
  );
  const [facultades] = await pool.query(
    "SELECT ID AS id, NOMBRE AS nombre FROM facultad ORDER BY NOMBRE",
  );

  return { departamentos, municipios, facultades };
}

export async function createCatedratic(payload) {
  const pool = getDatabasePool();

  const requiredFields = ["nombre", "apellido"];
  const missing = requiredFields.filter((f) => !payload[f]);
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(", ")}`);
  }

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

    const [catResult] = await connection.query(
      `INSERT INTO catedratico (ID_PERSO, ID_FACU, TIP_CONTRATO) VALUES (?, ?, ?)`,
      [
        personaId,
        payload.id_facultad ? Number(payload.id_facultad) : null,
        toNullable(payload.tip_contrato),
      ],
    );

    await connection.commit();

    return {
      id: catResult.insertId,
      nombre: payload.nombre,
      apellido: payload.apellido,
      message: `Catedrático "${payload.nombre} ${payload.apellido}" creado exitosamente.`,
    };
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Ya existe un registro con esos datos.");
    }
    throw error;
  } finally {
    connection.release();
  }
}
