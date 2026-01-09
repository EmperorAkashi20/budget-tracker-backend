const { Pool } = require("pg");
const { db } = require("./config");

const pool = new Pool({
  host: db.host,
  port: db.port,
  database: db.database,
  user: db.user,
  password: db.password,
  ssl: db.ssl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

async function healthcheck() {
  await pool.query("select 1 as ok");
}

module.exports = { pool, query, healthcheck };





