import { getDatabasePool } from "../database/mysql.js";

const useCreateStudentStoredProcedure =
  process.env.DB_USE_STUDENT_CREATE_SP === "true";

const studentSelect = `
  SELECT
    e.expediente,
    e.nombres,
    e.apellidos,
    e.cum,
    e.num_carnet,
    e.calidad,
    d.direccion AS direccion,
    dep.departamento AS departamento,
    m.municipio AS municipio,
    e.telefono,
    e.correo,
    c.nombre AS carrera,
    f.nombre AS facultad,
    e.edad,
    e.fecha_nac,
    CONCAT(r.nombres, ' ', r.apellidos) AS responsable,
    e.estado_academico,
    e.institucion_proc,
    e.anio_ingreso,
    ci.ciclo AS ciclo,
    ci.anio AS anio_ciclo,
    g.grupo AS grupo,
    p.plan_de_estudio AS plan_de_estudio,
    e.empleo
  FROM estudiante e
  LEFT JOIN direccion d ON d.id = e.id_direccion
  LEFT JOIN departamento dep ON dep.id = d.id_departamento
  LEFT JOIN municipio m ON m.id = d.id_municipio
  LEFT JOIN carrera c ON c.id = e.id_carrera
  LEFT JOIN facultad f ON f.id = c.id_facultad
  LEFT JOIN ciclo ci ON ci.id = e.id_ciclo
  LEFT JOIN grupo g ON g.id = e.id_grupo
  LEFT JOIN plan_de_estudio p ON p.id = e.id_plan_estu
  LEFT JOIN responsables r ON r.id = e.id_responsable
`;

const studentColumns = [
  "expediente",
  "nombres",
  "apellidos",
  "cum",
  "num_carnet",
  "calidad",
  "direccion",
  "departamento",
  "municipio",
  "telefono",
  "correo",
  "carrera",
  "facultad",
  "edad",
  "fecha_nac",
  "responsable",
  "estado_academico",
  "institucion_proc",
  "anio_ingreso",
  "ciclo",
  "anio_ciclo",
  "grupo",
  "plan_de_estudio",
  "empleo",
];

export async function getStudentsWithSchema(limit = 50) {
  const pool = getDatabasePool();
  const [rows] = await pool.query(`${studentSelect} ORDER BY e.expediente LIMIT ?`, [Number(limit)]);

  return {
    table: "estudiante",
    columns: studentColumns,
    rows,
  };
}

export async function getStudentByExpediente(expediente) {
  const pool = getDatabasePool();
  const [rows] = await pool.query(`${studentSelect} WHERE e.expediente = ? LIMIT 1`, [expediente]);
  return rows[0] || null;
}

export async function getEditableStudentByExpediente(expediente) {
  const pool = getDatabasePool();
  const sql = `
    SELECT
      e.expediente,
      e.nombres,
      e.apellidos,
      e.cum,
      e.num_carnet,
      e.calidad,
      dep.departamento,
      m.municipio,
      d.direccion,
      e.telefono,
      e.correo,
      e.id_carrera,
      e.edad,
      e.fecha_nac,
      e.id_responsable,
      e.estado_academico,
      e.institucion_proc,
      e.anio_ingreso,
      e.id_ciclo,
      e.id_grupo,
      e.id_plan_estu,
      e.empleo
    FROM estudiante e
    LEFT JOIN direccion d ON d.id = e.id_direccion
    LEFT JOIN departamento dep ON dep.id = d.id_departamento
    LEFT JOIN municipio m ON m.id = d.id_municipio
    WHERE e.expediente = ?
    LIMIT 1
  `;

  const [rows] = await pool.query(sql, [expediente]);
  return rows[0] || null;
}

function toNullable(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return value;
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return Number(value);
}

function validateCum(value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error("El campo cum debe ser numerico.");
  }

  if (parsed < 0) {
    throw new Error("El campo cum no permite valores negativos.");
  }
}

export async function getStudentFormOptions() {
  const pool = getDatabasePool();

  const [departamentos] = await pool.query("SELECT id, departamento FROM departamento ORDER BY departamento");
  const [municipios] = await pool.query("SELECT id, municipio FROM municipio ORDER BY municipio");
  const [carreras] = await pool.query("SELECT id, nombre FROM carrera ORDER BY nombre");
  const [responsables] = await pool.query("SELECT id, CONCAT(nombres, ' ', apellidos) AS nombre FROM responsables ORDER BY nombres, apellidos");
  const [ciclos] = await pool.query("SELECT id, CONCAT(ciclo, ' - ', anio) AS nombre FROM ciclo ORDER BY anio DESC, ciclo");
  const [grupos] = await pool.query("SELECT id, grupo FROM grupo ORDER BY grupo");
  const [planes] = await pool.query("SELECT id, plan_de_estudio FROM plan_de_estudio ORDER BY plan_de_estudio");

  return {
    departamentos,
    municipios,
    carreras,
    responsables,
    ciclos,
    grupos,
    planes,
  };
}

async function findOrCreateAddress(connection, payload) {
  const departamento = toNullable(payload.departamento)?.trim();
  const municipio = toNullable(payload.municipio)?.trim();
  const direccion = toNullable(payload.direccion)?.trim();

  if (!departamento || !municipio || !direccion) {
    throw new Error("Departamento, municipio y direccion son requeridos.");
  }

  const [departmentRows] = await connection.query(
    "SELECT id FROM departamento WHERE departamento = ? LIMIT 1",
    [departamento],
  );

  let departmentId = departmentRows[0]?.id;
  if (!departmentId) {
    const [departmentInsert] = await connection.query(
      "INSERT INTO departamento (departamento) VALUES (?)",
      [departamento],
    );
    departmentId = departmentInsert.insertId;
  }

  const [municipalityRows] = await connection.query(
    "SELECT id FROM municipio WHERE municipio = ? AND id_departamento = ? LIMIT 1",
    [municipio, departmentId],
  );

  let municipalityId = municipalityRows[0]?.id;
  if (!municipalityId) {
    const [municipalityInsert] = await connection.query(
      "INSERT INTO municipio (municipio, id_departamento) VALUES (?, ?)",
      [municipio, departmentId],
    );
    municipalityId = municipalityInsert.insertId;
  }

  const [addressRows] = await connection.query(
    "SELECT id FROM direccion WHERE direccion = ? AND id_departamento = ? AND id_municipio = ? LIMIT 1",
    [direccion, departmentId, municipalityId],
  );

  let addressId = addressRows[0]?.id;
  if (!addressId) {
    const [addressInsert] = await connection.query(
      "INSERT INTO direccion (direccion, id_departamento, id_municipio) VALUES (?, ?, ?)",
      [direccion, departmentId, municipalityId],
    );
    addressId = addressInsert.insertId;
  }

  return addressId;
}

export async function createStudent(payload) {
  const pool = getDatabasePool();

  const requiredFields = ["expediente", "nombres", "apellidos"];
  const missing = requiredFields.filter((field) => !payload[field]);
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(", ")}`);
  }

  validateCum(payload.cum);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    if (useCreateStudentStoredProcedure) {
      await connection.query("CALL sp_crear_estudiante(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        payload.expediente,
        payload.nombres,
        payload.apellidos,
        toNullable(payload.cum),
        toNullable(payload.num_carnet),
        toNullable(payload.calidad),
        toNullable(payload.departamento),
        toNullable(payload.municipio),
        toNullable(payload.direccion),
        toNullable(payload.telefono),
        toNullable(payload.correo),
        toNullableNumber(payload.id_carrera),
        toNullableNumber(payload.edad),
        toNullable(payload.fecha_nac),
        toNullableNumber(payload.id_responsable),
        toNullable(payload.estado_academico),
        toNullable(payload.institucion_proc),
        toNullable(payload.anio_ingreso),
        toNullableNumber(payload.id_ciclo),
        toNullableNumber(payload.id_grupo),
        toNullableNumber(payload.id_plan_estu),
        toNullable(payload.empleo),
      ]);

      await connection.commit();
      return getStudentByExpediente(payload.expediente);
    }

    const addressId = await findOrCreateAddress(connection, payload);

    const sql = `
      INSERT INTO estudiante (
        expediente, nombres, apellidos, cum, num_carnet, calidad,
        id_direccion, telefono, correo, id_carrera, edad, fecha_nac,
        id_responsable, estado_academico, institucion_proc, anio_ingreso,
        id_ciclo, id_grupo, id_plan_estu, empleo
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `;

    await connection.query(sql, [
      payload.expediente,
      payload.nombres,
      payload.apellidos,
      toNullable(payload.cum),
      toNullable(payload.num_carnet),
      toNullable(payload.calidad),
      addressId,
      toNullable(payload.telefono),
      toNullable(payload.correo),
      toNullableNumber(payload.id_carrera),
      toNullableNumber(payload.edad),
      toNullable(payload.fecha_nac),
      toNullableNumber(payload.id_responsable),
      toNullable(payload.estado_academico),
      toNullable(payload.institucion_proc),
      toNullable(payload.anio_ingreso),
      toNullableNumber(payload.id_ciclo),
      toNullableNumber(payload.id_grupo),
      toNullableNumber(payload.id_plan_estu),
      toNullable(payload.empleo),
    ]);

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
  const pool = getDatabasePool();
  const connection = await pool.getConnection();

  validateCum(payload.cum);

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      "SELECT expediente FROM estudiante WHERE expediente = ? LIMIT 1",
      [expediente],
    );

    if (!existingRows[0]) {
      throw new Error("Estudiante no encontrado.");
    }

    const addressId = await findOrCreateAddress(connection, payload);

    const sql = `
      UPDATE estudiante
      SET
        nombres = ?,
        apellidos = ?,
        cum = ?,
        num_carnet = ?,
        calidad = ?,
        id_direccion = ?,
        telefono = ?,
        correo = ?,
        id_carrera = ?,
        edad = ?,
        fecha_nac = ?,
        id_responsable = ?,
        estado_academico = ?,
        institucion_proc = ?,
        anio_ingreso = ?,
        id_ciclo = ?,
        id_grupo = ?,
        id_plan_estu = ?,
        empleo = ?
      WHERE expediente = ?
    `;

    await connection.query(sql, [
      toNullable(payload.nombres),
      toNullable(payload.apellidos),
      toNullable(payload.cum),
      toNullable(payload.num_carnet),
      toNullable(payload.calidad),
      addressId,
      toNullable(payload.telefono),
      toNullable(payload.correo),
      toNullableNumber(payload.id_carrera),
      toNullableNumber(payload.edad),
      toNullable(payload.fecha_nac),
      toNullableNumber(payload.id_responsable),
      toNullable(payload.estado_academico),
      toNullable(payload.institucion_proc),
      toNullable(payload.anio_ingreso),
      toNullableNumber(payload.id_ciclo),
      toNullableNumber(payload.id_grupo),
      toNullableNumber(payload.id_plan_estu),
      toNullable(payload.empleo),
      expediente,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return getStudentByExpediente(expediente);
}
