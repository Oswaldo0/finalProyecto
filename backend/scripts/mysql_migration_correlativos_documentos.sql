USE bd_uso_sonsonate;

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_add_column_if_missing $$
CREATE PROCEDURE sp_add_column_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_column_name VARCHAR(64),
  IN p_column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND column_name = p_column_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$

DROP PROCEDURE IF EXISTS sp_add_unique_if_missing $$
CREATE PROCEDURE sp_add_unique_if_missing(
  IN p_table_name VARCHAR(64),
  IN p_index_name VARCHAR(64),
  IN p_column_name VARCHAR(64)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = p_table_name
      AND index_name = p_index_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE ', p_table_name, ' ADD UNIQUE KEY ', p_index_name, ' (', p_column_name, ')');
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$

CALL sp_add_column_if_missing('penalidades', 'correlativo', 'VARCHAR(50) NULL AFTER ID') $$
CALL sp_add_column_if_missing('retiros_ciclo', 'correlativo', 'VARCHAR(50) NULL AFTER ID') $$
CALL sp_add_column_if_missing('equivalencias', 'correlativo', 'VARCHAR(50) NULL AFTER ID') $$
CALL sp_add_column_if_missing('absorciones', 'correlativo', 'VARCHAR(50) NULL AFTER id') $$

UPDATE penalidades
SET correlativo = CONCAT('PEN-', YEAR(FECHA), '-', LPAD(ID, 4, '0'))
WHERE correlativo IS NULL OR correlativo = '' $$

UPDATE retiros_ciclo
SET correlativo = CONCAT('RET-', YEAR(FECHA), '-', LPAD(ID, 4, '0'))
WHERE correlativo IS NULL OR correlativo = '' $$

UPDATE equivalencias
SET correlativo = CONCAT('EQ-', YEAR(COALESCE(FECHA_SOLICITUD, CREATED_AT)), '-', LPAD(ID, 4, '0'))
WHERE correlativo IS NULL OR correlativo = '' $$

UPDATE absorciones
SET correlativo = CONCAT('ABS-', YEAR(fecha), '-', LPAD(id, 4, '0'))
WHERE correlativo IS NULL OR correlativo = '' $$

CALL sp_add_unique_if_missing('penalidades', 'uq_penalidades_correlativo', 'correlativo') $$
CALL sp_add_unique_if_missing('retiros_ciclo', 'uq_retiros_ciclo_correlativo', 'correlativo') $$
CALL sp_add_unique_if_missing('equivalencias', 'uq_equivalencias_correlativo', 'correlativo') $$
CALL sp_add_unique_if_missing('absorciones', 'uq_absorciones_correlativo', 'correlativo') $$

DROP PROCEDURE IF EXISTS sp_regenerar_correlativos_documentos $$
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
END $$

DROP PROCEDURE IF EXISTS sp_add_column_if_missing $$
DROP PROCEDURE IF EXISTS sp_add_unique_if_missing $$

DELIMITER ;
