import "dotenv/config";
import sql from "mssql";

const sqlConfig = {
  server: process.env.DB_SERVER || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "BD_USO_SONSONATE",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== "false",
  },
};

async function exploreGrupoTable() {
  let pool;
  try {
    pool = await sql.connect(sqlConfig);
    console.log("✅ Conexión exitosa a la base de datos\n");

    // 1. Estructura de la tabla GRUPO
    console.log("📋 === ESTRUCTURA DE LA TABLA GRUPO ===");
    const columnInfo = await pool.request().query(`
      SELECT
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'GRUPO'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.table(columnInfo.recordset);

    // 2. Constraints y primarias
    console.log("\n🔑 === PRIMARY KEY Y CONSTRAINTS ===");
    const constraints = await pool.request().query(`
      SELECT
        CONSTRAINT_NAME,
        CONSTRAINT_TYPE,
        TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_NAME = 'GRUPO'
    `);
    
    console.table(constraints.recordset);

    // 3. Foreign Keys
    console.log("\n🔗 === FOREIGN KEYS ===");
    const fks = await pool.request().query(`
      SELECT
        FK.CONSTRAINT_NAME,
        FK.TABLE_NAME,
        FK.COLUMN_NAME,
        PK.TABLE_NAME AS REFERENCED_TABLE_NAME,
        PK.COLUMN_NAME AS REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS RC
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE FK
        ON RC.CONSTRAINT_NAME = FK.CONSTRAINT_NAME
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE PK
        ON RC.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME
      WHERE FK.TABLE_NAME = 'GRUPO'
    `);
    
    if (fks.recordset.length > 0) {
      console.table(fks.recordset);
    } else {
      console.log("No hay foreign keys definidas para GRUPO");
    }

    // 4. Índices
    console.log("\n📑 === ÍNDICES ===");
    const indexes = await pool.request().query(`
      SELECT
        name AS INDEX_NAME,
        type_desc AS INDEX_TYPE
      FROM sys.indexes
      WHERE object_id = OBJECT_ID('GRUPO')
        AND name IS NOT NULL
    `);
    
    if (indexes.recordset.length > 0) {
      console.table(indexes.recordset);
    } else {
      console.log("No hay índices adicionales para GRUPO");
    }

    // 5. Datos de ejemplo
    console.log("\n📊 === PRIMEROS 10 REGISTROS DE GRUPO ===");
    const sampleData = await pool.request().query(`
      SELECT TOP 10 * FROM GRUPO
    `);
    
    if (sampleData.recordset.length > 0) {
      console.table(sampleData.recordset);
    } else {
      console.log("La tabla GRUPO está vacía");
    }

    // 6. Contar registros
    console.log("\n📈 === ESTADÍSTICAS ===");
    const stats = await pool.request().query(`
      SELECT
        COUNT(*) AS TOTAL_REGISTROS
      FROM GRUPO
    `);
    console.log(`Total de grupos: ${stats.recordset[0].TOTAL_REGISTROS}`);

    // 7. Relaciones con otras tablas (buscar columnas de referencia en otras tablas)
    console.log("\n🔍 === TABLAS QUE REFERENCIAN A GRUPO ===");
    const referencingTables = await pool.request().query(`
      SELECT
        FK.CONSTRAINT_NAME,
        FK.TABLE_NAME AS TABLA_ORIGEN,
        FK.COLUMN_NAME AS COLUMNA_ORIGEN,
        PK.TABLE_NAME AS TABLA_DESTINO,
        PK.COLUMN_NAME AS COLUMNA_DESTINO
      FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS RC
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE FK
        ON RC.CONSTRAINT_NAME = FK.CONSTRAINT_NAME
      INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE PK
        ON RC.UNIQUE_CONSTRAINT_NAME = PK.CONSTRAINT_NAME
      WHERE PK.TABLE_NAME = 'GRUPO'
    `);
    
    if (referencingTables.recordset.length > 0) {
      console.table(referencingTables.recordset);
    } else {
      console.log("No hay tablas que referencien a GRUPO");
    }

    // 8. Información de tablas relacionadas (MATERIA, FACULTAD, CARRERA, etc.)
    console.log("\n📚 === ESTRUCTURA DE TABLAS RELACIONADAS ===");
    
    const tablesInfo = await pool.request().query(`
      SELECT DISTINCT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_NAME IN ('MATERIA', 'FACULTAD', 'CARRERA', 'PLAN_ESTUDIO', 'AULA', 'HORARIO')
    `);

    for (const tableRow of tablesInfo.recordset) {
      const tableName = tableRow.TABLE_NAME;
      console.log(`\n📄 Tabla: ${tableName}`);
      
      const tableColumns = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.table(tableColumns.recordset);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (pool) {
      await pool.close();
    }
    process.exit(0);
  }
}

exploreGrupoTable();
