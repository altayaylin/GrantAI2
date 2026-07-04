-- gpa/gpa_scale были numeric(3,2) — максимум 9.99.
-- Онбординг предлагает шкалы 10 и 100 (100-балльная система школ РК),
-- из-за чего сохранение профиля падало с "numeric field overflow".
alter table profiles
  alter column gpa type numeric(5,2),
  alter column gpa_scale type numeric(5,2);
