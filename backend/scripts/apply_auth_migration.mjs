import "dotenv/config";
import mysql from "mysql2/promise";
import { hashPassword } from "../src/infrastructure/security/passwordHash.js";

const connection = await mysql.createConnection({
  host: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "bd_uso_sonsonate",
});

async function ensureUsuariosTable() {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      estudiante_id BIGINT UNSIGNED NULL,
      nombre VARCHAR(150) NOT NULL,
      username VARCHAR(60) NOT NULL,
      email VARCHAR(150) NULL,
      password_hash VARCHAR(255) NOT NULL,
      rol ENUM('ADMIN', 'DECANO', 'SECRETARIO', 'OPERADOR', 'CONSULTA') NOT NULL DEFAULT 'OPERADOR',
      estado ENUM('ACTIVO', 'BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
      ultimo_login DATETIME NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_usuarios_username (username),
      UNIQUE KEY uq_usuarios_email (email)
    ) ENGINE=InnoDB
  `);
}

async function ensureColumnDefault(tableName, columnName, ddl) {
  const [rows] = await connection.query(
    `SELECT column_default
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?`,
    [tableName, columnName],
  );

  if (rows.length > 0 && rows[0].column_default == null) {
    await connection.query(ddl);
  }
}

async function seedAdminIfEmpty() {
  const [[{ total }]] = await connection.query(`SELECT COUNT(*) AS total FROM usuarios`);
  if (total > 0) {
    console.log("OK usuarios: ya existen cuentas.");
    return;
  }

  const username = process.env.AUTH_SEED_ADMIN_USERNAME || "admin";
  const password = process.env.AUTH_SEED_ADMIN_PASSWORD || "AdminUso2026!";
  const passwordHash = await hashPassword(password);

  await connection.query(
    `INSERT INTO usuarios (nombre, username, email, password_hash, rol, estado)
     VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVO')`,
    ["Administrador del Sistema", username, "admin@uso.local", passwordHash],
  );

  console.log(`ADMIN SEEDED username=${username}`);
}

try {
  await ensureUsuariosTable();
  await ensureColumnDefault(
    "usuarios",
    "ROL",
    "ALTER TABLE usuarios MODIFY rol ENUM('ADMIN', 'DECANO', 'SECRETARIO', 'OPERADOR', 'CONSULTA') NOT NULL DEFAULT 'OPERADOR'",
  );
  await ensureColumnDefault(
    "usuarios",
    "ESTADO",
    "ALTER TABLE usuarios MODIFY estado ENUM('ACTIVO', 'BLOQUEADO') NOT NULL DEFAULT 'ACTIVO'",
  );
  await seedAdminIfEmpty();
  console.log("AUTH MIGRATION OK");
} finally {
  await connection.end();
}
