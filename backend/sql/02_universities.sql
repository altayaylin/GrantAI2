-- Справочник вузов — ядро движка подбора
-- Публичная таблица: читают все, пишет только сервис

create table universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  qs_rank int,
  acceptance_rate numeric(4,3),       -- 0.04 = 4%
  sat_25th int,
  sat_75th int,
  avg_gpa numeric(3,2),
  min_ielts numeric(2,1),
  min_toefl int,
  majors text[],
  deadline date,
  tuition_usd int,
  has_scholarship boolean default false,
  created_at timestamptz default now()
);

create index idx_uni_country on universities(country);
create index idx_uni_majors on universities using gin(majors);

-- RLS: все могут читать, никто из клиентов не может писать напрямую
alter table universities enable row level security;

create policy "Все читают университеты"
  on universities for select
  using (true);
