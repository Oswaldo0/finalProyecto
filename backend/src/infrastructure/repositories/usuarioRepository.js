import pool from "../database/mysqlPool.js";

export async function findByUsername(username) {
  const [[usuario]] = await pool.query(
    `SELECT id,
            estudiante_id,
            nombre,
            username,
            email,
            password_hash,
            rol,
            estado,
            ultimo_login,
            created_at,
            updated_at
     FROM usuarios
     WHERE username = ?
     LIMIT 1`,
    [username],
  );

  return usuario ?? null;
}

export async function findById(id) {
  const [[usuario]] = await pool.query(
    `SELECT id,
            estudiante_id,
            nombre,
            username,
            email,
            rol,
            estado,
            ultimo_login,
            created_at,
            updated_at
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return usuario ?? null;
}

export async function findAll({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT id,
            estudiante_id,
            nombre,
            username,
            email,
            rol,
            estado,
            ultimo_login,
            created_at,
            updated_at
     FROM usuarios
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM usuarios`);
  return { data: rows.map(toPublicUser), total, page, limit };
}

export async function create({ nombre, username, email, password_hash, rol, estado }) {
  const [result] = await pool.query(
    `INSERT INTO usuarios (nombre, username, email, password_hash, rol, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, username, email ?? null, password_hash, rol ?? "OPERADOR", estado ?? "ACTIVO"],
  );

  return findById(result.insertId);
}

export async function update(id, { nombre, email, rol, estado }) {
  await pool.query(
    `UPDATE usuarios SET nombre = ?, email = ?, rol = ?, estado = ? WHERE id = ?`,
    [nombre, email ?? null, rol, estado, id],
  );

  return findById(id);
}

export async function updatePassword(id, password_hash) {
  await pool.query(`UPDATE usuarios SET password_hash = ? WHERE id = ?`, [password_hash, id]);
}

export async function updateUltimoLogin(id) {
  await pool.query(`UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?`, [id]);
}

export function toPublicUser(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    estudiante_id: usuario.estudiante_id,
    nombre: usuario.nombre,
    username: usuario.username,
    email: usuario.email,
    rol: usuario.rol,
    estado: usuario.estado,
    ultimo_login: usuario.ultimo_login,
  };
}
