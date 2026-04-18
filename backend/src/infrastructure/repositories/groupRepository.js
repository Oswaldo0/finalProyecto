import { getDatabasePool } from "../database/mysql.js";

// --- SELECT bases ---------------------------------------------------------------
const materiaSelect = `
  SELECT 
    m.ID AS id,
    m.NOMBRE AS nombre,
    c.NOMBRE AS carrera,
    f.NOMBRE AS facultad
  FROM materia m
  LEFT JOIN plan_estudio pe ON pe.ID = m.ID_PLES
  LEFT JOIN carrera c ON c.ID = pe.ID_CARRE
  LEFT JOIN facultad f ON f.ID = c.ID_FACU
  ORDER BY f.NOMBRE, c.NOMBRE, m.NOMBRE
`;

const catedraticSelect = `
  SELECT 
    c.ID AS id,
    p.NOMBRE AS nombre,
    p.APELLIDO AS apellido,
    f.NOMBRE AS facultad,
    p.TELEFONO AS telefono,
    p.CORREO AS correo
  FROM catedratico c
  JOIN persona p ON p.ID = c.ID_PERSO
  LEFT JOIN facultad f ON f.ID = c.ID_FACU
  ORDER BY p.NOMBRE, p.APELLIDO
`;

const cicloSelect = `
  SELECT 
    ID AS id,
    NOMBRE AS nombre
  FROM ciclo_academico
  ORDER BY NOMBRE DESC
`;

const aulasSelect = `
  SELECT 
    ID AS id,
    NOMBRE AS nombre,
    CAPACIDAD AS capacidad
  FROM aula
  ORDER BY NOMBRE
`;

const groupSelect = `
  SELECT 
    g.ID AS id,
    g.NOMBRE AS nombre,
    m.NOMBRE AS materia,
    CONCAT(p.NOMBRE, ' ', p.APELLIDO) AS catedratico,
    ca.NOMBRE AS ciclo,
    g.GRUPO_MAX AS grupo_max,
    g.ESTADO AS estado,
    COUNT(i.ID) AS estudiantes_inscritos
  FROM grupo g
  LEFT JOIN materia m ON m.ID = g.ID_MATE
  LEFT JOIN catedratico cate ON cate.ID = g.ID_CATE
  LEFT JOIN persona p ON p.ID = cate.ID_PERSO
  LEFT JOIN ciclo_academico ca ON ca.ID = g.ID_CICL
  LEFT JOIN inscripcion i ON i.ID_GRUP = g.ID
`;

// --- Obtener opciones de formulario -----------------------------------------------
export async function getMateriasForForm() {
  const pool = await getDatabasePool();
  const [rows] = await pool.query(materiaSelect);
  return rows;
}

export async function getCatedraticosForForm() {
  const pool = await getDatabasePool();
  const [rows] = await pool.query(catedraticSelect);
  return rows;
}

export async function getCiclosForForm() {
  const pool = await getDatabasePool();
  const [rows] = await pool.query(cicloSelect);
  return rows;
}

export async function getAulasForForm() {
  const pool = await getDatabasePool();
  const [rows] = await pool.query(aulasSelect);
  return rows;
}

// --- Crear grupo -----------------------------------------------
export async function createGroup(groupData) {
  const pool = await getDatabasePool();
  
  const { nombre, id_mate, id_cate, id_cicl, grupo_max = 50, estado = 'ACTIVO' } = groupData;
  
  if (!nombre || !id_mate || !id_cate || !id_cicl) {
    throw new Error("Faltan campos obligatorios: nombre, materia, catedrático o ciclo.");
  }

  try {
    const query = `
      INSERT INTO grupo (NOMBRE, ID_MATE, ID_CATE, ID_CICL, GRUPO_MAX, ESTADO)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(query, [
      nombre,
      id_mate,
      id_cate,
      id_cicl,
      grupo_max,
      estado
    ]);

    return {
      id: result.insertId,
      message: `Grupo "${nombre}" creado exitosamente con ID ${result.insertId}.`
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error(`El grupo "${nombre}" ya existe para este ciclo académico.`);
    }
    throw error;
  }
}

// --- Obtener todos los grupos -----------------------------------------------
export async function getGroupsWithStats() {
  const pool = await getDatabasePool();
  const query = `${groupSelect}
    WHERE g.ESTADO = 'ACTIVO'
    GROUP BY g.ID, g.NOMBRE, m.NOMBRE, p.NOMBRE, p.APELLIDO, ca.NOMBRE, g.GRUPO_MAX, g.ESTADO
    ORDER BY ca.NOMBRE DESC, m.NOMBRE, g.NOMBRE
  `;
  
  const [rows] = await pool.query(query);
  return rows;
}

// --- Obtener grupo por ID -----------------------------------------------
export async function getGroupById(groupId) {
  const pool = await getDatabasePool();
  const query = `${groupSelect}
    WHERE g.ID = ?
    GROUP BY g.ID, g.NOMBRE, m.NOMBRE, p.NOMBRE, p.APELLIDO, ca.NOMBRE, g.GRUPO_MAX, g.ESTADO
  `;
  
  const [rows] = await pool.query(query, [groupId]);
  return rows.length > 0 ? rows[0] : null;
}
