-- Run this as a Postgres admin/superuser (NOT as the app user).
-- Replace placeholders before executing.

-- 1) Create DB user
-- create user budget_tracker_app with password 'CHANGE_ME_STRONG_PASSWORD';

-- 2) Create DB
-- create database budget_tracker owner budget_tracker_app;

-- 3) Connect to the DB (psql: \c budget_tracker)
-- 4) Grant privileges (usually not needed if owner, but safe)
-- grant all privileges on database budget_tracker to budget_tracker_app;

-- Notes:
-- - If your server enforces SSL, set DB_POSTGRESDB_SSL=true in env.example.
-- - If your server has pg_hba rules, ensure budget_tracker_app can connect from your server's IP.





