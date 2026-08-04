-- Статус Pro-подписки (Polar)

alter table profiles add column is_pro boolean not null default false;
alter table profiles add column polar_customer_id text;
alter table profiles add column polar_subscription_id text;
alter table profiles add column pro_current_period_end timestamptz;
