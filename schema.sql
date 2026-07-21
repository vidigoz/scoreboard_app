create table if not exists games (
  id text primary key,
  team_a_name text not null default 'Equipo A',
  team_a_score integer not null default 0,
  team_b_name text not null default 'Equipo B',
  team_b_score integer not null default 0,
  status text not null default 'por_empezar',
  clock text not null default '--',
  period text not null default 'Por empezar',
  stadium text not null default '',
  city text not null default '',
  lat double precision,
  lng double precision,
  updated_at timestamptz not null default now()
);

-- Datos de ejemplo (bórralos cuando tengas juegos reales)
insert into games (id, team_a_name, team_a_score, team_b_name, team_b_score, status, clock, period, stadium, city)
values
  ('g1', 'Halcones', 4, 'Águilas', 2, 'en_vivo', 'Top 7', '7ma entrada', 'Estadio Quisqueya', 'Santo Domingo'),
  ('g2', 'Toros', 58, 'Leones', 61, 'en_vivo', '05:12', '4to cuarto', 'Estadio Cibao', 'Santiago'),
  ('g3', 'Tiburones', 0, 'Delfines', 0, 'por_empezar', '--', 'Por empezar', 'Coliseo Central', 'La Romana')
on conflict (id) do nothing;
