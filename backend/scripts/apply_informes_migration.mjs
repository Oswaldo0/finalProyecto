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

async function recreateTrigger(name, sql) {
  await connection.query(`DROP TRIGGER IF EXISTS ${name}`);
  await connection.query(sql);
  console.log(`TRIGGER OK ${name}`);
}

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS informe_documentos_resumen (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      source_table VARCHAR(80) NOT NULL,
      source_id BIGINT UNSIGNED NOT NULL,
      tipo_documento ENUM('PENALIDAD', 'RETIRO_CICLO', 'EQUIVALENCIA', 'ABSORCION') NOT NULL,
      correlativo VARCHAR(50) NULL,
      fecha_documento DATE NULL,
      estado VARCHAR(30) NULL,
      alumno_nombre VARCHAR(250) NULL,
      carrera_nombre VARCHAR(250) NULL,
      created_at DATETIME NULL,
      updated_at DATETIME NULL,
      synced_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_informe_documento_source (source_table, source_id),
      KEY idx_informe_tipo (tipo_documento),
      KEY idx_informe_fecha (fecha_documento),
      KEY idx_informe_estado (estado),
      KEY idx_informe_carrera (carrera_nombre)
    ) ENGINE=InnoDB
  `);

  await connection.query(`
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    SELECT 'penalidades', ID, 'PENALIDAD', correlativo, FECHA, ESTADO, ALUMNO_NOMBRE, CARRERA_NOMBRE, CREATED_AT, UPDATED_AT
    FROM penalidades
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      created_at = VALUES(created_at),
      updated_at = VALUES(updated_at)
  `);

  await connection.query(`
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    SELECT 'retiros_ciclo', ID, 'RETIRO_CICLO', correlativo, FECHA, ESTADO, ALUMNO_NOMBRE, CARRERA_NOMBRE, CREATED_AT, UPDATED_AT
    FROM retiros_ciclo
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      created_at = VALUES(created_at),
      updated_at = VALUES(updated_at)
  `);

  await connection.query(`
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    SELECT 'equivalencias', ID, 'EQUIVALENCIA', correlativo, COALESCE(FECHA_SOLICITUD, DATE(CREATED_AT)), ESTADO, ALUMNO_NOMBRE, CARRERA_DESTINO, CREATED_AT, UPDATED_AT
    FROM equivalencias
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      created_at = VALUES(created_at),
      updated_at = VALUES(updated_at)
  `);

  await connection.query(`
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    SELECT 'absorciones', id, 'ABSORCION', correlativo, fecha, estado, TRIM(CONCAT(alumno_nombres, ' ', alumno_apellidos)), carrera_origen, created_at, updated_at
    FROM absorciones
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      created_at = VALUES(created_at),
      updated_at = VALUES(updated_at)
  `);

  await recreateTrigger("trg_penalidades_informe_ai", `
    CREATE TRIGGER trg_penalidades_informe_ai
    AFTER INSERT ON penalidades
    FOR EACH ROW
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    VALUES ('penalidades', NEW.ID, 'PENALIDAD', NEW.correlativo, NEW.FECHA, NEW.ESTADO, NEW.ALUMNO_NOMBRE, NEW.CARRERA_NOMBRE, NEW.CREATED_AT, NEW.UPDATED_AT)
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      updated_at = VALUES(updated_at)
  `);

  await recreateTrigger("trg_penalidades_informe_au", `
    CREATE TRIGGER trg_penalidades_informe_au
    AFTER UPDATE ON penalidades
    FOR EACH ROW
    UPDATE informe_documentos_resumen
    SET correlativo = NEW.correlativo,
        fecha_documento = NEW.FECHA,
        estado = NEW.ESTADO,
        alumno_nombre = NEW.ALUMNO_NOMBRE,
        carrera_nombre = NEW.CARRERA_NOMBRE,
        updated_at = NEW.UPDATED_AT
    WHERE source_table = 'penalidades' AND source_id = NEW.ID
  `);

  await recreateTrigger("trg_penalidades_informe_ad", `
    CREATE TRIGGER trg_penalidades_informe_ad
    AFTER DELETE ON penalidades
    FOR EACH ROW
    DELETE FROM informe_documentos_resumen
    WHERE source_table = 'penalidades' AND source_id = OLD.ID
  `);

  await recreateTrigger("trg_retiros_informe_ai", `
    CREATE TRIGGER trg_retiros_informe_ai
    AFTER INSERT ON retiros_ciclo
    FOR EACH ROW
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    VALUES ('retiros_ciclo', NEW.ID, 'RETIRO_CICLO', NEW.correlativo, NEW.FECHA, NEW.ESTADO, NEW.ALUMNO_NOMBRE, NEW.CARRERA_NOMBRE, NEW.CREATED_AT, NEW.UPDATED_AT)
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      updated_at = VALUES(updated_at)
  `);

  await recreateTrigger("trg_retiros_informe_au", `
    CREATE TRIGGER trg_retiros_informe_au
    AFTER UPDATE ON retiros_ciclo
    FOR EACH ROW
    UPDATE informe_documentos_resumen
    SET correlativo = NEW.correlativo,
        fecha_documento = NEW.FECHA,
        estado = NEW.ESTADO,
        alumno_nombre = NEW.ALUMNO_NOMBRE,
        carrera_nombre = NEW.CARRERA_NOMBRE,
        updated_at = NEW.UPDATED_AT
    WHERE source_table = 'retiros_ciclo' AND source_id = NEW.ID
  `);

  await recreateTrigger("trg_retiros_informe_ad", `
    CREATE TRIGGER trg_retiros_informe_ad
    AFTER DELETE ON retiros_ciclo
    FOR EACH ROW
    DELETE FROM informe_documentos_resumen
    WHERE source_table = 'retiros_ciclo' AND source_id = OLD.ID
  `);

  await recreateTrigger("trg_equivalencias_informe_ai", `
    CREATE TRIGGER trg_equivalencias_informe_ai
    AFTER INSERT ON equivalencias
    FOR EACH ROW
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    VALUES ('equivalencias', NEW.ID, 'EQUIVALENCIA', NEW.correlativo, COALESCE(NEW.FECHA_SOLICITUD, DATE(NEW.CREATED_AT)), NEW.ESTADO, NEW.ALUMNO_NOMBRE, NEW.CARRERA_DESTINO, NEW.CREATED_AT, NEW.UPDATED_AT)
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      updated_at = VALUES(updated_at)
  `);

  await recreateTrigger("trg_equivalencias_informe_au", `
    CREATE TRIGGER trg_equivalencias_informe_au
    AFTER UPDATE ON equivalencias
    FOR EACH ROW
    UPDATE informe_documentos_resumen
    SET correlativo = NEW.correlativo,
        fecha_documento = COALESCE(NEW.FECHA_SOLICITUD, DATE(NEW.CREATED_AT)),
        estado = NEW.ESTADO,
        alumno_nombre = NEW.ALUMNO_NOMBRE,
        carrera_nombre = NEW.CARRERA_DESTINO,
        updated_at = NEW.UPDATED_AT
    WHERE source_table = 'equivalencias' AND source_id = NEW.ID
  `);

  await recreateTrigger("trg_equivalencias_informe_ad", `
    CREATE TRIGGER trg_equivalencias_informe_ad
    AFTER DELETE ON equivalencias
    FOR EACH ROW
    DELETE FROM informe_documentos_resumen
    WHERE source_table = 'equivalencias' AND source_id = OLD.ID
  `);

  await recreateTrigger("trg_absorciones_informe_ai", `
    CREATE TRIGGER trg_absorciones_informe_ai
    AFTER INSERT ON absorciones
    FOR EACH ROW
    INSERT INTO informe_documentos_resumen
      (source_table, source_id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre, created_at, updated_at)
    VALUES ('absorciones', NEW.id, 'ABSORCION', NEW.correlativo, NEW.fecha, NEW.estado, TRIM(CONCAT(NEW.alumno_nombres, ' ', NEW.alumno_apellidos)), NEW.carrera_origen, NEW.created_at, NEW.updated_at)
    ON DUPLICATE KEY UPDATE
      correlativo = VALUES(correlativo),
      fecha_documento = VALUES(fecha_documento),
      estado = VALUES(estado),
      alumno_nombre = VALUES(alumno_nombre),
      carrera_nombre = VALUES(carrera_nombre),
      updated_at = VALUES(updated_at)
  `);

  await recreateTrigger("trg_absorciones_informe_au", `
    CREATE TRIGGER trg_absorciones_informe_au
    AFTER UPDATE ON absorciones
    FOR EACH ROW
    UPDATE informe_documentos_resumen
    SET correlativo = NEW.correlativo,
        fecha_documento = NEW.fecha,
        estado = NEW.estado,
        alumno_nombre = TRIM(CONCAT(NEW.alumno_nombres, ' ', NEW.alumno_apellidos)),
        carrera_nombre = NEW.carrera_origen,
        updated_at = NEW.updated_at
    WHERE source_table = 'absorciones' AND source_id = NEW.id
  `);

  await recreateTrigger("trg_absorciones_informe_ad", `
    CREATE TRIGGER trg_absorciones_informe_ad
    AFTER DELETE ON absorciones
    FOR EACH ROW
    DELETE FROM informe_documentos_resumen
    WHERE source_table = 'absorciones' AND source_id = OLD.id
  `);

  await connection.query("DROP PROCEDURE IF EXISTS sp_informe_documentos_resumen");
  await connection.query(`
    CREATE PROCEDURE sp_informe_documentos_resumen(
      IN p_fecha_desde DATE,
      IN p_fecha_hasta DATE,
      IN p_tipo_documento VARCHAR(30),
      IN p_estado VARCHAR(30)
    )
    BEGIN
      SELECT tipo_documento, COUNT(*) AS total
      FROM informe_documentos_resumen
      WHERE (p_fecha_desde IS NULL OR fecha_documento >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR fecha_documento <= p_fecha_hasta)
        AND (p_tipo_documento IS NULL OR p_tipo_documento = '' OR tipo_documento = p_tipo_documento)
        AND (p_estado IS NULL OR p_estado = '' OR estado = p_estado)
      GROUP BY tipo_documento
      ORDER BY tipo_documento;

      SELECT estado, COUNT(*) AS total
      FROM informe_documentos_resumen
      WHERE (p_fecha_desde IS NULL OR fecha_documento >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR fecha_documento <= p_fecha_hasta)
        AND (p_tipo_documento IS NULL OR p_tipo_documento = '' OR tipo_documento = p_tipo_documento)
        AND (p_estado IS NULL OR p_estado = '' OR estado = p_estado)
      GROUP BY estado
      ORDER BY estado;

      SELECT DATE_FORMAT(fecha_documento, '%Y-%m') AS periodo, COUNT(*) AS total
      FROM informe_documentos_resumen
      WHERE fecha_documento IS NOT NULL
        AND (p_fecha_desde IS NULL OR fecha_documento >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR fecha_documento <= p_fecha_hasta)
        AND (p_tipo_documento IS NULL OR p_tipo_documento = '' OR tipo_documento = p_tipo_documento)
        AND (p_estado IS NULL OR p_estado = '' OR estado = p_estado)
      GROUP BY DATE_FORMAT(fecha_documento, '%Y-%m')
      ORDER BY periodo;

      SELECT id, tipo_documento, correlativo, fecha_documento, estado, alumno_nombre, carrera_nombre
      FROM informe_documentos_resumen
      WHERE (p_fecha_desde IS NULL OR fecha_documento >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR fecha_documento <= p_fecha_hasta)
        AND (p_tipo_documento IS NULL OR p_tipo_documento = '' OR tipo_documento = p_tipo_documento)
        AND (p_estado IS NULL OR p_estado = '' OR estado = p_estado)
      ORDER BY fecha_documento DESC, id DESC
      LIMIT 200;
    END
  `);

  console.log("INFORMES MIGRATION OK");
} finally {
  await connection.end();
}
