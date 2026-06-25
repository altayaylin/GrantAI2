-- Список вузов студента (many-to-many: students ↔ universities)

create table student_university_list (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  university_id uuid references universities(id) on delete cascade,
  category text,                        -- 'safety' | 'match' | 'reach'
  match_score numeric(4,3),             -- score на момент добавления
  added_at timestamptz default now(),
  unique(student_id, university_id)
);

create index idx_sul_student on student_university_list(student_id);

-- RLS: студент управляет только своим списком
alter table student_university_list enable row level security;

create policy "Студент видит свой список"
  on student_university_list for select
  using (auth.uid() = student_id);

create policy "Студент добавляет в свой список"
  on student_university_list for insert
  with check (auth.uid() = student_id);

create policy "Студент удаляет из своего списка"
  on student_university_list for delete
  using (auth.uid() = student_id);
