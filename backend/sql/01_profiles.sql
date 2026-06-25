-- Таблица профилей студентов
-- Связана с таблицей авторизации Supabase (auth.users)

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  school text,
  grade int,
  city text,
  major text,
  target_countries text[],
  gpa numeric(3,2),
  gpa_scale numeric(3,2) default 4.0,
  sat_total int,
  sat_math int,
  sat_ebrw int,
  ielts numeric(2,1),
  toefl int,
  activities_count int default 0,
  awards_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: каждый студент видит и редактирует только свой профиль
alter table profiles enable row level security;

create policy "Студент видит свой профиль"
  on profiles for select
  using (auth.uid() = id);

create policy "Студент создаёт свой профиль"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Студент редактирует свой профиль"
  on profiles for update
  using (auth.uid() = id);

create policy "Студент удаляет свой профиль"
  on profiles for delete
  using (auth.uid() = id);
