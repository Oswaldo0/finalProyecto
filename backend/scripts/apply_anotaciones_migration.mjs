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

const catalogosIniciales = {
  observadores: [
    "ING. MARILYN JACQUELINE HERNANDEZ",
    "MTRA. ANA MARÍA ZELIDÓN DE LEMUS",
    "LIC. JOSÉ FRANCISCO PATIÑO NOYOLA",
    "ING. MANUEL DE JESÚS URRUTIA",
    "ING. OSWALDO ENRIQUE LARÍN",
    "ING. JOSÉ ADOLFO PACAS TORRES",
    "MTRO. MARIO JOSÉ CRUZ PAYÉS",
    "MTRO. ÁNGEL ERNESTO MONGE LARA",
  ],
  facultades: [
    "FACULTAD DE CIENCIAS JURIDICAS",
    "FACULTAD DE INGENIERIA Y CIENCIAS NATURALES",
    "FACULTAD DE ECONOMIA Y CIENCIAS SOCIALES",
    "ESCUELA DE EDUCACIÓN",
    "FACULTAD DE CIENCIAS DE LA SALUD",
  ],
  horarios: [
    "7:00 a.m. - 8:30 a.m.",
    "8:30 a.m. - 10:00 a.m.",
    "10:00 a.m. - 11:30 a.m.",
    "1:00 p.m. - 2:30 p.m.",
    "2:30 p.m. - 4:00 p.m.",
    "5:30 p.m. - 7:00 p.m.",
  ],
};

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS anotaciones_catalogos (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      tipo ENUM('observadores', 'facultades', 'horarios') NOT NULL,
      valor VARCHAR(180) NOT NULL,
      estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_anotaciones_catalogo_tipo_valor (tipo, valor),
      KEY idx_anotaciones_catalogo_tipo (tipo)
    ) ENGINE=InnoDB
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS anotaciones (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      correlativo VARCHAR(50) NULL,
      usuario_id BIGINT UNSIGNED NULL,
      observador VARCHAR(180) NOT NULL,
      fecha DATE NOT NULL,
      hora_inicio VARCHAR(40) NOT NULL,
      hora_fin VARCHAR(40) NOT NULL,
      asignatura_grupo VARCHAR(180) NOT NULL,
      facultad VARCHAR(180) NOT NULL,
      horario VARCHAR(80) NOT NULL,
      docente VARCHAR(180) NOT NULL,
      aula VARCHAR(80) NOT NULL,
      ciclo VARCHAR(60) NOT NULL,
      observaciones TEXT NOT NULL,
      estado ENUM('BORRADOR', 'EMITIDA', 'ANULADA') NOT NULL DEFAULT 'BORRADOR',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_anotaciones_correlativo (correlativo),
      CONSTRAINT fk_anotaciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      KEY idx_anotaciones_fecha (fecha),
      KEY idx_anotaciones_observador (observador),
      KEY idx_anotaciones_facultad (facultad)
    ) ENGINE=InnoDB
  `);

  const rows = Object.entries(catalogosIniciales).flatMap(([tipo, valores]) =>
    valores.map((valor) => [tipo, valor]),
  );

  await connection.query(
    `INSERT INTO anotaciones_catalogos (tipo, valor)
     VALUES ?
     ON DUPLICATE KEY UPDATE estado = 'ACTIVO', valor = VALUES(valor)`,
    [rows],
  );

  console.log("MIGRATION OK anotaciones");
} finally {
  await connection.end();
}
