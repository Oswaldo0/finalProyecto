import "dotenv/config";
import mysql from "mysql2/promise";

const databaseName = process.env.DB_NAME || "BD_USO_SONSONATE";

const mysqlConfig = {
  host: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

function validateConfig() {
  if (!mysqlConfig.user || !mysqlConfig.password) {
    throw new Error("Faltan DB_USER o DB_PASSWORD en las variables de entorno.");
  }
}

export function getDatabasePool() {
  validateConfig();

  if (!pool) {
    pool = mysql.createPool(mysqlConfig);
  }

  return pool;
}

export async function checkDatabaseConnection() {
  const databasePool = getDatabasePool();
  await databasePool.query("SELECT 1 AS connected");

  return {
    connected: true,
    database: databaseName,
    server: mysqlConfig.host,
    port: mysqlConfig.port,
  };
}

export async function closeDatabasePool() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}
