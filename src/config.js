function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name, fallback) {
  const v = process.env[name];
  return v == null || v === "" ? fallback : v;
}

function parseBool(v) {
  if (typeof v !== "string") return false;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

module.exports = {
  port: Number(optional("PORT", "4000")),
  nodeEnv: optional("NODE_ENV", "development"),
  corsOrigin: optional("CORS_ORIGIN", "*"),
  db: {
    host: required("DB_POSTGRESDB_HOST"),
    port: Number(optional("DB_POSTGRESDB_PORT", "5432")),
    database: required("DB_POSTGRESDB_NAME"),
    user: required("DB_POSTGRESDB_USER"),
    password: required("DB_POSTGRESDB_PASSWORD"),
    ssl: parseBool(optional("DB_POSTGRESDB_SSL", "false")),
  },
};





