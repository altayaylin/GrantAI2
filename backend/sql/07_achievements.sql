-- Достижения и активности студента (с возможностью прикрепить файл)

create table achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'activity', -- 'activity' | 'award'
  file_url text,
  file_name text,
  created_at timestamptz default now()
);

create index idx_achievements_student on achievements(student_id);

alter table achievements enable row level security;

create policy "Студент видит свои достижения"
  on achievements for select
  using (auth.uid() = student_id);

create policy "Студент добавляет свои достижения"
  on achievements for insert
  with check (auth.uid() = student_id);

create policy "Студент удаляет свои достижения"
  on achievements for delete
  using (auth.uid() = student_id);

-- Бакет для файлов достижений (сертификаты, дипломы, портфолио)
insert into storage.buckets (id, name, public)
values ('achievements', 'achievements', true)
on conflict (id) do nothing;

create policy "Публичное чтение файлов достижений"
  on storage.objects for select
  using (bucket_id = 'achievements');

create policy "Студент загружает файлы в свою папку"
  on storage.objects for insert
  with check (
    bucket_id = 'achievements'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Студент удаляет свои файлы"
  on storage.objects for delete
  using (
    bucket_id = 'achievements'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
