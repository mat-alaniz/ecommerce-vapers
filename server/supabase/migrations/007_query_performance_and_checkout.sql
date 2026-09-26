create index if not exists idx_orders_user_created_at
  on public.orders (user_id, created_at desc);

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_order_items_product_id
  on public.order_items (product_id);

create index if not exists idx_orders_pending_created_at
  on public.orders (created_at desc)
  where is_paid = false;

create index if not exists idx_profiles_created_at
  on public.profiles (created_at desc);

create or replace function public.admin_dashboard_stats()
returns table (
  total_users bigint,
  total_orders bigint,
  total_revenue numeric,
  total_units_sold bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.profiles),
    (select count(*) from public.orders),
    (select coalesce(sum(total_amount), 0) from public.orders),
    (select coalesce(sum(quantity), 0)::bigint from public.order_items);
$$;

create or replace function public.admin_users_page(p_page integer, p_page_size integer)
returns table (
  total_count bigint,
  id uuid,
  email text,
  full_name text,
  phone text,
  role text,
  total_units_purchased integer,
  created_at timestamptz,
  total_spent numeric,
  total_paid numeric
)
language sql
security definer
set search_path = public
as $$
  with total_profiles as (
    select count(*) as total_count
    from public.profiles
  ),
  user_page as (
    select
      p.id,
      p.email::text as email,
      p.full_name::text as full_name,
      p.phone::text as phone,
      p.role::text as role,
      coalesce(p.total_units_purchased, 0)::integer as total_units_purchased,
      p.created_at
    from public.profiles p
    order by p.created_at desc, p.id
    limit least(greatest(p_page_size, 1), 100)
    offset greatest(p_page - 1, 0) * least(greatest(p_page_size, 1), 100)
  )
  select
    t.total_count,
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.role,
    u.total_units_purchased,
    u.created_at,
    coalesce(sum(o.total_amount), 0),
    coalesce(sum(o.amount_paid), 0)
  from total_profiles t
  left join user_page u on true
  left join public.orders o on o.user_id = u.id
  group by
    t.total_count,
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.role,
    u.total_units_purchased,
    u.created_at
  order by u.created_at desc nulls last, u.id nulls last;
$$;

create or replace function public.create_order(
  p_user_id uuid,
  p_items jsonb,
  p_stock_type text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
  v_stock record;
  v_order_id public.orders.id%type;
  v_initial_units integer;
  v_running_units integer;
  v_discounted_units integer;
  v_quantity integer;
  v_price numeric;
  v_line_discount numeric;
  v_total numeric := 0;
  v_total_discount numeric := 0;
  v_order_items jsonb := '[]'::jsonb;
  v_item_count integer;
  v_matched_products integer;
  v_available_stock integer;
begin
  if p_stock_type not in ('mobile', 'warehouse') then
    raise exception 'INVALID_STOCK_TYPE';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER';
  end if;

  select count(*)
  into v_item_count
  from jsonb_to_recordset(p_items) as item(product_id integer, quantity integer)
  where item.product_id is null or item.product_id <= 0
     or item.quantity is null or item.quantity <= 0;

  if v_item_count > 0 then
    raise exception 'INVALID_ORDER_ITEMS';
  end if;

  select coalesce(total_units_purchased, 0)
  into v_initial_units
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  perform p.id
  from public.products p
  join (
    select distinct item.product_id
    from jsonb_to_recordset(p_items) as item(product_id integer, quantity integer)
  ) requested on requested.product_id = p.id
  order by p.id
  for update of p;

  select count(*)
  into v_matched_products
  from public.products p
  join (
    select distinct item.product_id
    from jsonb_to_recordset(p_items) as item(product_id integer, quantity integer)
  ) requested on requested.product_id = p.id;

  select count(distinct item.product_id)
  into v_item_count
  from jsonb_to_recordset(p_items) as item(product_id integer, quantity integer);

  if v_matched_products <> v_item_count then
    raise exception 'PRODUCT_NOT_FOUND';
  end if;

  for v_stock in
    select item.product_id, sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id integer, quantity integer)
    group by item.product_id
    order by item.product_id
  loop
    if p_stock_type = 'mobile' then
      select coalesce(stock_mobile, 0)
      into v_available_stock
      from public.products
      where id = v_stock.product_id;
    else
      select coalesce(stock_warehouse, 0)
      into v_available_stock
      from public.products
      where id = v_stock.product_id;
    end if;

    if v_available_stock < v_stock.quantity then
      raise exception 'INSUFFICIENT_STOCK';
    end if;
  end loop;

  v_running_units := v_initial_units;

  for v_item in
    select item.product_id, item.quantity
    from jsonb_to_recordset(p_items) with ordinality as item(
      product_id integer,
      quantity integer,
      item_ordinality bigint
    )
    order by item.item_ordinality
  loop
    select price
    into v_price
    from public.products
    where id = v_item.product_id;

    v_quantity := v_item.quantity;
    v_discounted_units := ((v_running_units + v_quantity) / 6) - (v_running_units / 6);
    v_line_discount := round(v_price * v_discounted_units / 2, 2);
    v_running_units := v_running_units + v_quantity;
    v_total := v_total + (v_price * v_quantity) - v_line_discount;
    v_total_discount := v_total_discount + v_line_discount;

    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_item.product_id,
      'quantity', v_quantity,
      'unit_price', v_price,
      'discount_per_unit', round(v_line_discount / v_quantity, 2)
    ));
  end loop;

  insert into public.orders (
    user_id,
    total_amount,
    discount_applied,
    status,
    amount_paid,
    is_paid,
    payment_method
  ) values (
    p_user_id,
    round(v_total, 2),
    round(v_total_discount, 2),
    'completada',
    0,
    false,
    null
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    quantity,
    unit_price,
    discount_per_unit
  )
  select
    v_order_id,
    item.product_id,
    item.quantity,
    item.unit_price,
    item.discount_per_unit
  from jsonb_to_recordset(v_order_items) as item(
    product_id integer,
    quantity integer,
    unit_price numeric,
    discount_per_unit numeric
  );

  for v_stock in
    select item.product_id, sum(item.quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as item(product_id integer, quantity integer)
    group by item.product_id
    order by item.product_id
  loop
    if p_stock_type = 'mobile' then
      update public.products
      set stock_mobile = coalesce(stock_mobile, 0) - v_stock.quantity
      where id = v_stock.product_id;
    else
      update public.products
      set stock_warehouse = coalesce(stock_warehouse, 0) - v_stock.quantity
      where id = v_stock.product_id;
    end if;
  end loop;

  update public.profiles
  set total_units_purchased = v_running_units
  where id = p_user_id;

  return jsonb_build_object(
    'success', true,
    'orderId', v_order_id,
    'total', round(v_total, 2),
    'discount', round(v_total_discount, 2),
    'totalUnits', v_running_units
  );
end;
$$;

revoke all on function public.admin_dashboard_stats() from public, anon, authenticated;
revoke all on function public.admin_users_page(integer, integer) from public, anon, authenticated;
revoke all on function public.create_order(uuid, jsonb, text) from public, anon, authenticated;

grant execute on function public.admin_dashboard_stats() to service_role;
grant execute on function public.admin_users_page(integer, integer) to service_role;
grant execute on function public.create_order(uuid, jsonb, text) to service_role;

notify pgrst, 'reload schema';