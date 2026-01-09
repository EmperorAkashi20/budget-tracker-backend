// Creates app user + database if missing, then applies schema 001_init.sql.
// Usage:
// node scripts/setup_db.js --host 13.126.187.252 --port 5432 --admin-user rishabh --admin-password 'xxx' --db budget_tracker --app-user budget_tracker_app --app-password 'yyy' --ssl false
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

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

async function connectAdmin(args, database = "postgres") {
  const client = new Client({
    host: args.host,
    port: Number(args.port || 5432),
    user: args["admin-user"],
    password: args["admin-password"],
    database,
    ssl: String(args.ssl || "false").toLowerCase() === "true" ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10_000,
  });
  await client.connect();
  return client;
}

async function ensureRole(client, roleName, password) {
  const exists = await client.query("select 1 from pg_roles where rolname = $1", [roleName]);
  if (!exists.rowCount) {
    // Basic identifier safety: allow letters, numbers, underscore only
    if (!/^[a-zA-Z0-9_]+$/.test(roleName)) {
      throw new Error("Invalid role name");
    }
    const pw = String(password).replace(/'/g, "''");
    await client.query(`create role ${roleName} login password '${pw}'`);
    console.log(`Created role ${roleName}`);
  } else {
    console.log(`Role ${roleName} exists`);
  }
}

async function ensureDatabase(client, dbName, owner) {
  const existsDb = await client.query("select 1 from pg_database where datname = $1", [dbName]);
  if (!existsDb.rowCount) {
    await client.query(`create database ${dbName} owner ${owner}`);
    console.log(`Created database ${dbName}`);
  } else {
    console.log(`Database ${dbName} exists`);
  }
}

async function applySchema(args) {
  const adminDbClient = await connectAdmin(args, args.db);
  try {
    const sqlPath = path.join(__dirname, "..", "sql", "001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    await adminDbClient.query(sql);
    console.log("Applied schema 001_init.sql");
  } finally {
    await adminDbClient.end();
  }
}

async function main() {
  const a = parseArgs(process.argv);
  if (!a.host || !a["admin-user"] || !a["admin-password"] || !a.db || !a["app-user"] || !a["app-password"]) {
    console.error("Missing required args. See file header for usage.");
    process.exit(1);
  }
  const admin = await connectAdmin(a);
  try {
    await ensureRole(admin, a["app-user"], a["app-password"]);
    await ensureDatabase(admin, a.db, a["app-user"]);
  } finally {
    await admin.end();
  }
  await applySchema(a);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


