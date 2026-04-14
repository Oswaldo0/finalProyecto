import "dotenv/config";
import sql from "mssql";

const databaseName = process.env.DB_NAME || "BD_USO_SONSONATE";

const sqlConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: databaseName,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

function validateConfig() {
  if (!sqlConfig.user || !sqlConfig.password) {
    throw new Error("Faltan DB_USER o DB_PASSWORD en las variables de entorno.");
  }
}

export async function getDatabasePool() {
  validateConfig();

  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig);
  }

  return poolPromise;
}

export async function checkDatabaseConnection() {
  const pool = await getDatabasePool();
  await pool.request().query("SELECT 1 AS connected");

  return {
    connected: true,
    database: databaseName,
    server: sqlConfig.server,
  };
}

export async function closeDatabasePool() {
  if (!poolPromise) {
    return;
  }

  const pool = await poolPromise;
  await pool.close();
  poolPromise = undefined;
}
