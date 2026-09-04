import "dotenv/config";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "bd_uso_sonsonate",
  multipleStatements: true,
});

try {
  await connection.query(`
    ALTER TABLE anotaciones
      MODIFY estado ENUM('CREADO', 'EMITIDA', 'IMPRESO', 'ANULADA') NOT NULL DEFAULT 'CREADO';

    ALTER TABLE penalidades
      MODIFY estado ENUM('CREADO', 'EMITIDA', 'IMPRESO', 'ANULADA') NOT NULL DEFAULT 'CREADO';

    ALTER TABLE retiros_ciclo
      MODIFY estado ENUM('CREADO', 'EMITIDO', 'IMPRESO', 'ANULADO') NOT NULL DEFAULT 'CREADO';

    ALTER TABLE equivalencias
      MODIFY estado ENUM('CREADO', 'REVISION', 'IMPRESO', 'APROBADA', 'DENEGADA') NOT NULL DEFAULT 'CREADO';

    ALTER TABLE absorciones
      MODIFY estado ENUM('CREADO', 'EMITIDO', 'IMPRESO', 'ANULADO') NOT NULL DEFAULT 'CREADO';
  `);

  console.log("MIGRATION OK estado IMPRESO");
} finally {
  await connection.end();
}
