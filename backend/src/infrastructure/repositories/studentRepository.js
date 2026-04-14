import { getDatabasePool } from "../database/mysql.js";

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

export async function getStudentFormOptions() {
  const pool = getDatabasePool();

  const [direcciones] = await pool.query("SELECT id, direccion FROM direccion ORDER BY direccion");
  const [carreras] = await pool.query("SELECT id, nombre FROM carrera ORDER BY nombre");
  const [responsables] = await pool.query("SELECT id, CONCAT(nombres, ' ', apellidos) AS nombre FROM responsables ORDER BY nombres, apellidos");
  const [ciclos] = await pool.query("SELECT id, CONCAT(ciclo, ' - ', anio) AS nombre FROM ciclo ORDER BY anio DESC, ciclo");
  const [grupos] = await pool.query("SELECT id, grupo FROM grupo ORDER BY grupo");
  const [planes] = await pool.query("SELECT id, plan_de_estudio FROM plan_de_estudio ORDER BY plan_de_estudio");

  return {
    direcciones,
    carreras,
    responsables,
    ciclos,
    grupos,
    planes,
  };
}

export async function createStudent(payload) {
  const pool = getDatabasePool();

  const requiredFields = ["expediente", "nombres", "apellidos"];
  const missing = requiredFields.filter((field) => !payload[field]);
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(", ")}`);
  }

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

  await pool.query(sql, [
    payload.expediente,
    payload.nombres,
    payload.apellidos,
    toNullable(payload.cum),
    toNullable(payload.num_carnet),
    toNullable(payload.calidad),
    toNullableNumber(payload.id_direccion),
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

  return getStudentByExpediente(payload.expediente);
}
