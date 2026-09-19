alter table public.orders
  add column if not exists amount_paid numeric(10, 2) not null default 0,
  add column if not exists is_paid boolean not null default false,
  add column if not exists payment_method text;

update public.orders
set amount_paid = 0
where amount_paid is null;

update public.orders
set is_paid = false
where is_paid is null;

alter table public.orders
  alter column amount_paid set default 0,
  alter column amount_paid set not null,
  alter column is_paid set default false,
  alter column is_paid set not null;

alter table public.orders
  drop constraint if exists orders_payment_method_check;

alter table public.orders
  add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('efectivo', 'transferencia', 'mercado_pago'));
