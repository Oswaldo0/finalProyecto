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

async function addColumnIfMissing(tableName, columnName, columnDefinition) {
  const [rows] = await connection.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?`,
    [tableName, columnName],
  );

  if (rows.length === 0) {
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    console.log(`ADD COLUMN ${tableName}.${columnName}`);
    return;
  }

  console.log(`OK COLUMN ${tableName}.${columnName}`);
}

async function addUniqueIfMissing(tableName, indexName, columnName) {
  const [rows] = await connection.query(
    `SELECT 1
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND index_name = ?`,
    [tableName, indexName],
  );

  if (rows.length === 0) {
    await connection.query(`ALTER TABLE ${tableName} ADD UNIQUE KEY ${indexName} (${columnName})`);
    console.log(`ADD UNIQUE ${tableName}.${indexName}`);
    return;
  }

  console.log(`OK UNIQUE ${tableName}.${indexName}`);
}

try {
  await addColumnIfMissing("penalidades", "correlativo", "VARCHAR(50) NULL AFTER ID");
  await addColumnIfMissing("retiros_ciclo", "correlativo", "VARCHAR(50) NULL AFTER ID");
  await addColumnIfMissing("equivalencias", "correlativo", "VARCHAR(50) NULL AFTER ID");
  await addColumnIfMissing("absorciones", "correlativo", "VARCHAR(50) NULL AFTER id");

  await connection.query(
    "UPDATE penalidades SET correlativo = CONCAT('PEN-', YEAR(FECHA), '-', LPAD(ID, 4, '0')) WHERE correlativo IS NULL OR correlativo = ''",
  );
  await connection.query(
    "UPDATE retiros_ciclo SET correlativo = CONCAT('RET-', YEAR(FECHA), '-', LPAD(ID, 4, '0')) WHERE correlativo IS NULL OR correlativo = ''",
  );
  await connection.query(
    "UPDATE equivalencias SET correlativo = CONCAT('EQ-', YEAR(COALESCE(FECHA_SOLICITUD, CREATED_AT)), '-', LPAD(ID, 4, '0')) WHERE correlativo IS NULL OR correlativo = ''",
  );
  await connection.query(
    "UPDATE absorciones SET correlativo = CONCAT('ABS-', YEAR(fecha), '-', LPAD(id, 4, '0')) WHERE correlativo IS NULL OR correlativo = ''",
  );

  await addUniqueIfMissing("penalidades", "uq_penalidades_correlativo", "correlativo");
  await addUniqueIfMissing("retiros_ciclo", "uq_retiros_ciclo_correlativo", "correlativo");
  await addUniqueIfMissing("equivalencias", "uq_equivalencias_correlativo", "correlativo");
  await addUniqueIfMissing("absorciones", "uq_absorciones_correlativo", "correlativo");

  await connection.query("DROP PROCEDURE IF EXISTS sp_regenerar_correlativos_documentos");
  await connection.query(`
    CREATE PROCEDURE sp_regenerar_correlativos_documentos()
    BEGIN
      UPDATE penalidades
      SET correlativo = CONCAT('PEN-', YEAR(FECHA), '-', LPAD(ID, 4, '0'));

      UPDATE retiros_ciclo
      SET correlativo = CONCAT('RET-', YEAR(FECHA), '-', LPAD(ID, 4, '0'));

      UPDATE equivalencias
      SET correlativo = CONCAT('EQ-', YEAR(COALESCE(FECHA_SOLICITUD, CREATED_AT)), '-', LPAD(ID, 4, '0'));

      UPDATE absorciones
      SET correlativo = CONCAT('ABS-', YEAR(fecha), '-', LPAD(id, 4, '0'));
    END
  `);

  console.log("MIGRATION OK");
} finally {
  await connection.end();
}
