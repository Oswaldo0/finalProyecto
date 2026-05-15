import mysql from "mysql2/promise";
try {
  const conn = await mysql.createConnection({host:"localhost",port:3306,user:"root",password:"admin",database:"bd_uso_sonsonate"});
  const [rows] = await conn.query("SHOW TABLES");
  console.log("CONNECTED");
  for(const r of rows) console.log("-", Object.values(r)[0]);
  await conn.end();
} catch(e) {
  console.error("ERROR:", e.message);
}
