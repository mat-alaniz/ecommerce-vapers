alter table public.orders
  alter column total_amount type numeric(10, 2) using total_amount::numeric,
  alter column discount_applied type numeric(10, 2) using discount_applied::numeric;

alter table public.order_items
  alter column unit_price type numeric(10, 2) using unit_price::numeric,
  alter column discount_per_unit type numeric(10, 2) using discount_per_unit::numeric;