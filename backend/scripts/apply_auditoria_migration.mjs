import "dotenv/config";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "bd_uso_sonsonate",
});

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS auditoria_eventos (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      usuario_id BIGINT UNSIGNED NULL,
      username VARCHAR(60) NULL,
      rol VARCHAR(30) NULL,
      metodo VARCHAR(10) NOT NULL,
      ruta VARCHAR(255) NOT NULL,
      accion ENUM('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'IMPRIMIR') NOT NULL,
      entidad VARCHAR(80) NULL,
      estado_http SMALLINT UNSIGNED NULL,
      ip VARCHAR(80) NULL,
      user_agent VARCHAR(255) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL,
      KEY idx_auditoria_usuario (usuario_id),
      KEY idx_auditoria_accion (accion),
      KEY idx_auditoria_created_at (created_at)
    ) ENGINE=InnoDB
  `);

  console.log("AUDITORIA MIGRATION OK");
} finally {
  await connection.end();
}
