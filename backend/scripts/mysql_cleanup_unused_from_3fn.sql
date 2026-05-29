-- Limpieza opcional para una BD creada con la version 3FN anterior (con campos extras)
-- Ejecutar solo si ya creaste tablas con ese esquema extendido.

USE universidad_sonsonate;

SET FOREIGN_KEY_CHECKS = 0;

-- Tablas no usadas por el backend actual
DROP TABLE IF EXISTS absorcion_detalles;
DROP TABLE IF EXISTS absorciones;
DROP TABLE IF EXISTS equivalencia_carreras_origen;
DROP TABLE IF EXISTS ciclos_academicos;
DROP TABLE IF EXISTS asignaturas;
DROP TABLE IF EXISTS instituciones;
DROP TABLE IF EXISTS autoridades;

-- Columnas extra en tablas principales (si existen)
ALTER TABLE penalidades
  DROP COLUMN IF EXISTS secretario_id,
  DROP COLUMN IF EXISTS decano_id,
  DROP COLUMN IF EXISTS ciclo_reingreso_id,
  DROP COLUMN IF EXISTS ciclo_reingreso_texto;

ALTER TABLE retiro_ciclo_asignaturas
  DROP COLUMN IF EXISTS asignatura_id;

ALTER TABLE penalidad_asignaturas
  DROP COLUMN IF EXISTS asignatura_id;

ALTER TABLE retiros_ciclo
  DROP COLUMN IF EXISTS decano_id,
  DROP COLUMN IF EXISTS facultad_id,
  DROP COLUMN IF EXISTS ciclo_a_retirar_id,
  DROP COLUMN IF EXISTS ciclo_a_retirar_texto;

ALTER TABLE equivalencias
  DROP COLUMN IF EXISTS carrera_destino_id,
  DROP COLUMN IF EXISTS decano_id;

ALTER TABLE equivalencia_detalles
  DROP COLUMN IF EXISTS asignatura_origen_id,
  DROP COLUMN IF EXISTS asignatura_origen_texto,
  DROP COLUMN IF EXISTS institucion_id,
  DROP COLUMN IF EXISTS asignatura_destino_id,
  DROP COLUMN IF EXISTS asignatura_destino_texto;

SET FOREIGN_KEY_CHECKS = 1;
