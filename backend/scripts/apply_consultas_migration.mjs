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
    CREATE TABLE IF NOT EXISTS consultas_estudiantes
    (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      correlativo VARCHAR(50) NULL,
      usuario_id BIGINT UNSIGNED NULL,
      estudiante_id BIGINT UNSIGNED NULL,
      carrera_id BIGINT UNSIGNED NULL,
      tipo_consulta VARCHAR(80) NOT NULL,
      coordinador_nombres VARCHAR(120) NOT NULL,
      coordinador_apellidos VARCHAR(120) NOT NULL,
      alumno_nombres VARCHAR(120) NOT NULL,
      alumno_apellidos VARCHAR(120) NOT NULL,
      fecha_consulta DATE NOT NULL,
      ciclo VARCHAR(60) NOT NULL,
      carrera_nombre VARCHAR(180) NOT NULL,
      materia_nombre VARCHAR(180) NOT NULL DEFAULT 'SIN ASIGNAR',
      consulta TEXT NOT NULL,
      respuesta TEXT NOT NULL,
      estado ENUM('CREADO', 'IMPRESO', 'ANULADA') NOT NULL DEFAULT 'CREADO',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_consultas_estudiantes_correlativo (correlativo),
      CONSTRAINT fk_consultas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      CONSTRAINT fk_consultas_estudiante
        FOREIGN KEY (estudiante_id) REFERENCES estudiantes (id),
      CONSTRAINT fk_consultas_carrera
        FOREIGN KEY (carrera_id) REFERENCES carreras (id),
      KEY idx_consultas_fecha (fecha_consulta),
      KEY idx_consultas_tipo (tipo_consulta),
      KEY idx_consultas_alumno (alumno_apellidos, alumno_nombres),
      KEY idx_consultas_carrera_nombre (carrera_nombre),
      KEY idx_consultas_estado (estado)
    ) ENGINE=InnoDB;
  `);

  console.log("MIGRATION OK consultas_estudiantes");
} finally {
  await connection.end();
}
