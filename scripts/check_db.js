// Usage:
// node scripts/check_db.js --host 13.126.187.252 --port 5432 --user rishabh --password 'xxx' --database postgres --ssl false
const { Client } = require("pg");
require("dotenv").config();

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k.startsWith("--")) {
      const key = k.slice(2);
      const val = argv[i + 1];
      args[key] = val;
      i++;
    }
  }
  return args;
}

async function main() {
  const a = parseArgs(process.argv);
  const client = new Client({
    host: a.host || process.env.DB_HOST || process.env.DB_POSTGRESDB_HOST,
    port: Number(a.port || process.env.DB_PORT || process.env.DB_POSTGRESDB_PORT || 5432),
    user: a.user || process.env.DB_USER || process.env.DB_POSTGRESDB_USER,
    password: a.password || process.env.DB_PASSWORD || process.env.DB_POSTGRESDB_PASSWORD,
    database: a.database || process.env.DB_NAME || process.env.DB_POSTGRESDB_NAME || "postgres",
    ssl: String(a.ssl || process.env.DB_SSL || process.env.DB_POSTGRESDB_SSL || "false").toLowerCase() === "true" ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10_000,
  });
  try {
    await client.connect();
    const res = await client.query("select version()");
    console.log("Connected:", res.rows[0].version);
  } catch (e) {
    console.error("Connection failed:", e.message || e);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch {}
  }
}

main();


