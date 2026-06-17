import pool from "../database/mysqlPool.js";

export async function create(evento) {
  await pool.query(
    `INSERT INTO auditoria_eventos
      (usuario_id, username, rol, metodo, ruta, accion, entidad, estado_http, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      evento.usuario_id ?? null,
      evento.username ?? null,
      evento.rol ?? null,
      evento.metodo,
      evento.ruta,
      evento.accion,
      evento.entidad ?? null,
      evento.estado_http ?? null,
      evento.ip ?? null,
      evento.user_agent ?? null,
    ],
  );
}

export async function findAll({ page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT id,
            usuario_id,
            username,
            rol,
            metodo,
            ruta,
            accion,
            entidad,
            estado_http,
            ip,
            user_agent,
            created_at
     FROM auditoria_eventos
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset],
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM auditoria_eventos`);
  return { data: rows, total, page, limit };
}
