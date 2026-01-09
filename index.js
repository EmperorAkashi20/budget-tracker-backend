const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const config = require("./src/config");
const db = require("./src/db");
const { tripSchema } = require("./src/validators");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin,
    credentials: true,
  })
);

app.get("/health", async (_req, res) => {
  try {
    await db.healthcheck();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// One-time helper endpoint: apply schema from sql/001_init.sql
// You can remove/disable this once deployed.
app.post("/admin/apply-schema", async (_req, res) => {
  try {
    const sqlPath = path.join(__dirname, "sql", "001_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    await db.query(sql);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Trips CRUD
app.get("/api/trips", async (_req, res) => {
  try {
    const result = await db.query(
      `select id, name, start_date, end_date, updated_at
       from trips
       order by updated_at desc`
    );
    res.json({ trips: result.rows });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.get("/api/trips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`select data from trips where id = $1`, [id]);
    if (!result.rows.length)
      return res.status(404).json({ error: "not_found" });
    res.json(result.rows[0].data);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.post("/api/trips", async (req, res) => {
  try {
    const parsed = tripSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "invalid_trip", details: parsed.error.flatten() });
    const trip = parsed.data;
    await db.query(
      `insert into trips (id, name, start_date, end_date, data)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update set
         name = excluded.name,
         start_date = excluded.start_date,
         end_date = excluded.end_date,
         data = excluded.data,
         updated_at = now()`,
      [trip.id, trip.name, trip.startDate, trip.endDate, trip]
    );
    res.status(201).json({ ok: true, id: trip.id });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.put("/api/trips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = tripSchema.safeParse({ ...req.body, id });
    if (!parsed.success)
      return res
        .status(400)
        .json({ error: "invalid_trip", details: parsed.error.flatten() });
    const trip = parsed.data;
    await db.query(
      `update trips
       set name = $2,
           start_date = $3,
           end_date = $4,
           data = $5,
           updated_at = now()
       where id = $1`,
      [id, trip.name, trip.startDate, trip.endDate, trip]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.delete("/api/trips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`delete from trips where id = $1`, [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

app.listen(config.port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`budget-tracker-be listening on 0.0.0.0:${config.port}`);
});
