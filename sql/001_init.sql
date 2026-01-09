-- Minimal schema (stores entire Trip JSON from the FE in jsonb for flexibility)
create table if not exists trips (
  id text primary key,
  name text not null,
  start_date date,
  end_date date,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_updated_at_idx on trips (updated_at desc);





