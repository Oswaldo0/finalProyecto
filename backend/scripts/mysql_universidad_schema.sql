CREATE DATABASE IF NOT EXISTS universidad_sonsonate
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE universidad_sonsonate;

CREATE TABLE facultades (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  codigo VARCHAR(30) NULL,
  estado ENUM('ACTIVA', 'INACTIVA') NOT NULL DEFAULT 'ACTIVA',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_facultades_nombre (nombre),
  UNIQUE KEY uq_facultades_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE carreras (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  facultad_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  codigo VARCHAR(30) NULL,
  estado ENUM('ACTIVA', 'INACTIVA') NOT NULL DEFAULT 'ACTIVA',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carreras_facultad
    FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  UNIQUE KEY uq_carreras_facultad_nombre (facultad_id, nombre),
  UNIQUE KEY uq_carreras_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE planes_estudio (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  carrera_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  anio SMALLINT UNSIGNED NULL,
  estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_planes_estudio_carrera
    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
  UNIQUE KEY uq_planes_estudio (carrera_id, nombre)
) ENGINE=InnoDB;

CREATE TABLE estudiantes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  expediente VARCHAR(30) NOT NULL,
  carnet VARCHAR(30) NULL,
  nombres VARCHAR(120) NOT NULL,
  apellidos VARCHAR(120) NULL,
  nombre_completo VARCHAR(250) GENERATED ALWAYS AS (
    TRIM(CONCAT(nombres, ' ', COALESCE(apellidos, '')))
  ) STORED,
  carrera_actual_id BIGINT UNSIGNED NULL,
  plan_estudio_id BIGINT UNSIGNED NULL,
  email VARCHAR(150) NULL,
  telefono VARCHAR(20) NULL,
  estado ENUM('ACTIVO', 'INACTIVO', 'EGRESADO', 'GRADUADO') NOT NULL DEFAULT 'ACTIVO',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_estudiantes_carrera_actual
    FOREIGN KEY (carrera_actual_id) REFERENCES carreras(id),
  CONSTRAINT fk_estudiantes_plan_estudio
    FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudio(id),
  UNIQUE KEY uq_estudiantes_expediente (expediente),
  UNIQUE KEY uq_estudiantes_carnet (carnet)
) ENGINE=InnoDB;

CREATE TABLE usuarios (
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
  CONSTRAINT fk_usuarios_estudiante
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  UNIQUE KEY uq_usuarios_username (username),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE penalidades (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudiante_id BIGINT UNSIGNED NULL,
  carrera_id BIGINT UNSIGNED NULL,
  usuario_id BIGINT UNSIGNED NULL,
  secretario_nombre VARCHAR(150) NOT NULL,
  decano_nombre VARCHAR(150) NOT NULL,
  fecha DATE NOT NULL,
  cantidad_anios_egreso SMALLINT UNSIGNED NOT NULL,
  ciclo_reingreso VARCHAR(30) NOT NULL,
  alumno_nombre VARCHAR(150) NOT NULL,
  carrera_nombre VARCHAR(150) NOT NULL,
  mes_egreso VARCHAR(30) NOT NULL,
  anio_egreso SMALLINT UNSIGNED NOT NULL,
  anios_egresado SMALLINT UNSIGNED NOT NULL,
  estado ENUM('BORRADOR', 'EMITIDA', 'ANULADA') NOT NULL DEFAULT 'BORRADOR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_penalidades_estudiante
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  CONSTRAINT fk_penalidades_carrera
    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
  CONSTRAINT fk_penalidades_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  KEY idx_penalidades_fecha (fecha),
  KEY idx_penalidades_alumno (alumno_nombre)
) ENGINE=InnoDB;

CREATE TABLE penalidad_asignaturas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  penalidad_id BIGINT UNSIGNED NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  asignatura_nombre VARCHAR(150) NOT NULL,
  uv DECIMAL(4,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_penalidad_asignaturas_penalidad
    FOREIGN KEY (penalidad_id) REFERENCES penalidades(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_penalidad_orden (penalidad_id, orden)
) ENGINE=InnoDB;

CREATE TABLE retiros_ciclo (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudiante_id BIGINT UNSIGNED NULL,
  carrera_id BIGINT UNSIGNED NULL,
  usuario_id BIGINT UNSIGNED NULL,
  expediente VARCHAR(30) NOT NULL,
  carnet VARCHAR(30) NOT NULL,
  fecha DATE NOT NULL,
  alumno_nombre VARCHAR(150) NOT NULL,
  carrera_nombre VARCHAR(150) NOT NULL,
  ciclo_a_retirar VARCHAR(30) NOT NULL,
  articulo_referencia VARCHAR(100) NULL,
  texto_resolucion TEXT NOT NULL,
  observacion_final TEXT NULL,
  decano_nombre VARCHAR(150) NOT NULL,
  facultad_nombre VARCHAR(150) NOT NULL,
  estado ENUM('BORRADOR', 'EMITIDO', 'ANULADO') NOT NULL DEFAULT 'BORRADOR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_retiros_ciclo_estudiante
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  CONSTRAINT fk_retiros_ciclo_carrera
    FOREIGN KEY (carrera_id) REFERENCES carreras(id),
  CONSTRAINT fk_retiros_ciclo_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  KEY idx_retiros_ciclo_fecha (fecha),
  KEY idx_retiros_ciclo_expediente (expediente)
) ENGINE=InnoDB;

CREATE TABLE retiro_ciclo_asignaturas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  retiro_ciclo_id BIGINT UNSIGNED NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  asignatura_nombre VARCHAR(150) NOT NULL,
  uv DECIMAL(4,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_retiro_ciclo_asignaturas_retiro
    FOREIGN KEY (retiro_ciclo_id) REFERENCES retiros_ciclo(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_retiro_ciclo_orden (retiro_ciclo_id, orden)
) ENGINE=InnoDB;

CREATE TABLE equivalencias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudiante_id BIGINT UNSIGNED NULL,
  usuario_id BIGINT UNSIGNED NULL,
  fecha_solicitud DATE NULL,
  alumno_nombre VARCHAR(150) NOT NULL,
  carreras_cursadas VARCHAR(250) NULL,
  carrera_destino VARCHAR(250) NULL,
  texto_solicitud TEXT NOT NULL,
  notas_universidad TEXT NULL,
  decano_nombre VARCHAR(150) NULL,
  fecha_decano DATE NULL,
  alumno_nombre_firma VARCHAR(150) NULL,
  estado ENUM('BORRADOR', 'REVISION', 'APROBADA', 'DENEGADA') NOT NULL DEFAULT 'BORRADOR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_equivalencias_estudiante
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  CONSTRAINT fk_equivalencias_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  KEY idx_equivalencias_fecha (fecha_solicitud),
  KEY idx_equivalencias_alumno (alumno_nombre)
) ENGINE=InnoDB;

CREATE TABLE equivalencia_detalles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  equivalencia_id BIGINT UNSIGNED NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  asignatura_cursada VARCHAR(150) NOT NULL,
  uv DECIMAL(4,2) NULL,
  nota DECIMAL(4,2) NULL,
  institucion_nombre VARCHAR(180) NULL,
  asignatura_solicitada VARCHAR(150) NOT NULL,
  resultado ENUM('PENDIENTE', 'APROBADA', 'DENEGADA') NOT NULL DEFAULT 'PENDIENTE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_equivalencia_detalles_equivalencia
    FOREIGN KEY (equivalencia_id) REFERENCES equivalencias(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_equivalencia_detalle_orden (equivalencia_id, orden)
) ENGINE=InnoDB;

CREATE TABLE absorciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudiante_id BIGINT UNSIGNED NULL,
  facultad_id BIGINT UNSIGNED NULL,
  usuario_id BIGINT UNSIGNED NULL,
  facultad_nombre VARCHAR(150) NOT NULL,
  ciclo VARCHAR(30) NOT NULL,
  fecha DATE NOT NULL,
  alumno_nombres VARCHAR(120) NOT NULL,
  alumno_apellidos VARCHAR(120) NOT NULL,
  carrera_origen VARCHAR(150) NOT NULL,
  plan_origen VARCHAR(120) NOT NULL,
  plan_solicitado VARCHAR(120) NOT NULL,
  encabezado_dictamen TEXT NOT NULL,
  decano_nombre VARCHAR(150) NOT NULL,
  facultad_firma_nombre VARCHAR(150) NOT NULL,
  estado ENUM('BORRADOR', 'EMITIDO', 'ANULADO') NOT NULL DEFAULT 'BORRADOR',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_absorciones_estudiante
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  CONSTRAINT fk_absorciones_facultad
    FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  CONSTRAINT fk_absorciones_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  KEY idx_absorciones_fecha (fecha),
  KEY idx_absorciones_ciclo (ciclo)
) ENGINE=InnoDB;

CREATE TABLE absorcion_asignaturas_absorbidas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  absorcion_id BIGINT UNSIGNED NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  asignatura_cursada VARCHAR(150) NOT NULL,
  asignatura_absorbida VARCHAR(150) NOT NULL,
  nota_asignada DECIMAL(4,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_absorcion_absorbidas_absorcion
    FOREIGN KEY (absorcion_id) REFERENCES absorciones(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_absorcion_absorbidas_orden (absorcion_id, orden)
) ENGINE=InnoDB;

CREATE TABLE absorcion_asignaturas_no_existentes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  absorcion_id BIGINT UNSIGNED NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  asignatura_nombre VARCHAR(150) NOT NULL,
  nota DECIMAL(4,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_absorcion_no_existentes_absorcion
    FOREIGN KEY (absorcion_id) REFERENCES absorciones(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_absorcion_no_existentes_orden (absorcion_id, orden)
) ENGINE=InnoDB;

CREATE TABLE absorcion_asignaturas_reprobadas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  absorcion_id BIGINT UNSIGNED NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  asignatura_nombre VARCHAR(150) NOT NULL,
  nota DECIMAL(4,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_absorcion_reprobadas_absorcion
    FOREIGN KEY (absorcion_id) REFERENCES absorciones(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_absorcion_reprobadas_orden (absorcion_id, orden)
) ENGINE=InnoDB;
