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
  const tablas = [
    { nombre: "anotaciones", valores: "'CREADO', 'EMITIDA', 'IMPRESO', 'ANULADA'" },
    { nombre: "penalidades", valores: "'CREADO', 'EMITIDA', 'IMPRESO', 'ANULADA'" },
    { nombre: "retiros_ciclo", valores: "'CREADO', 'EMITIDO', 'IMPRESO', 'ANULADO'" },
    { nombre: "equivalencias", valores: "'CREADO', 'REVISION', 'IMPRESO', 'APROBADA', 'DENEGADA'" },
    { nombre: "absorciones", valores: "'CREADO', 'EMITIDO', 'IMPRESO', 'ANULADO'" },
  ];

  for (const tabla of tablas) {
    const [[resultado]] = await connection.query(
      `SELECT COUNT(*) AS existe
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name = ?`,
      [tabla.nombre],
    );

    if (Number(resultado.existe) === 0) {
      console.log(`SKIP ${tabla.nombre}: no existe`);
      continue;
    }

    await connection.query(
      `ALTER TABLE ${tabla.nombre}
       MODIFY estado ENUM('BORRADOR', ${tabla.valores}) NOT NULL DEFAULT 'CREADO'`,
    );
    await connection.query(`UPDATE ${tabla.nombre} SET estado = 'CREADO' WHERE estado = 'BORRADOR'`);
    await connection.query(
      `ALTER TABLE ${tabla.nombre}
       MODIFY estado ENUM(${tabla.valores}) NOT NULL DEFAULT 'CREADO'`,
    );
    console.log(`ESTADO OK ${tabla.nombre}`);
  }

  const [[resumen]] = await connection.query(
    `SELECT COUNT(*) AS existe
     FROM information_schema.tables
     WHERE table_schema = DATABASE()
       AND table_name = 'informe_documentos_resumen'`,
  );

  if (Number(resumen.existe) > 0) {
    await connection.query("UPDATE informe_documentos_resumen SET estado = 'CREADO' WHERE estado = 'BORRADOR'");
  }

  console.log("MIGRATION OK estado CREADO");
} finally {
  await connection.end();
}
