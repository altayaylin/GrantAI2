-- Дедлайны студента
-- Заполняются автоматически при добавлении вуза или вручную

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  title text not null,
  source_type text,                     -- 'university' | 'activity' | 'manual'
  source_id uuid,                       -- ссылка на university_id или activity_id
  due_date date not null,
  category text,                        -- 'Вуз' | 'Летняя программа' | 'Личное'
  completed boolean default false,
  created_at timestamptz default now()
);

create index idx_deadlines_student on deadlines(student_id);
create index idx_deadlines_due_date on deadlines(student_id, due_date);

-- RLS: студент управляет только своими дедлайнами
alter table deadlines enable row level security;

create policy "Студент видит свои дедлайны"
  on deadlines for select
  using (auth.uid() = student_id);

create policy "Студент создаёт свои дедлайны"
  on deadlines for insert
  with check (auth.uid() = student_id);

create policy "Студент редактирует свои дедлайны"
  on deadlines for update
  using (auth.uid() = student_id);

create policy "Студент удаляет свои дедлайны"
  on deadlines for delete
  using (auth.uid() = student_id);
