drop function if exists public.decrement_products_stock(jsonb);

create or replace function public.decrement_products_stock(
  p_items jsonb,
  p_stock_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  product_id_value integer;
  quantity_value integer;
  available_stock integer;
begin
  if p_stock_type not in ('mobile', 'warehouse') then
    raise exception 'INVALID_STOCK_TYPE';
  end if;

  for item in select * from jsonb_array_elements(p_items)
  loop
    product_id_value := (item->>'product_id')::integer;
    quantity_value := (item->>'quantity')::integer;

    if quantity_value <= 0 then
      raise exception 'INVALID_STOCK_QUANTITY';
    end if;

    if p_stock_type = 'mobile' then
      select coalesce(stock_mobile, 0)
        into available_stock
        from public.products
        where id = product_id_value
        for update;
    else
      select coalesce(stock_warehouse, 0)
        into available_stock
        from public.products
        where id = product_id_value
        for update;
    end if;

    if not found or available_stock < quantity_value then
      raise exception 'INSUFFICIENT_STOCK';
    end if;

    if p_stock_type = 'mobile' then
      update public.products
        set stock_mobile = stock_mobile - quantity_value
        where id = product_id_value;
    else
      update public.products
        set stock_warehouse = stock_warehouse - quantity_value
        where id = product_id_value;
    end if;
  end loop;
end;
$$;

revoke execute on function public.decrement_products_stock(jsonb, text) from public, anon, authenticated;
grant execute on function public.decrement_products_stock(jsonb, text) to service_role;

notify pgrst, 'reload schema';