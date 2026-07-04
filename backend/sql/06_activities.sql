-- Справочник активностей (стажировки, research, олимпиады, волонтёрство)
-- Заполняется через backend/ingest_activities.py, а не напрямую из клиента.

create table activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  org text,
  category text not null,              -- 'internship' | 'research' | 'olympiad' | 'volunteer'
  country text,
  format text,                          -- 'Онлайн' | 'Офлайн' | 'Гибрид'
  cost text,                            -- 'free' | 'paid' | 'stipend'
  cost_label text,
  grades int[],                         -- [9,10,11,12]
  level text,
  deadline date,
  duration text,
  tags text[],
  prestige int,                         -- 1..5
  about text,
  link text,
  source text not null default 'curated', -- 'curated' | 'github:<owner>/<repo>' | ...
  verified boolean default true,        -- false = взято автопарсингом, требует проверки перед показом
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_activities_category on activities(category);
create index idx_activities_tags on activities using gin(tags);

-- RLS: читают все, пишет только сервис (ingestion-скрипт с service_role key)
alter table activities enable row level security;

create policy "Все читают активности"
  on activities for select
  using (true);
