create or replace function public.decrement_products_stock(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  product_id_value integer;
  quantity_value integer;
  mobile_stock integer;
  warehouse_stock integer;
  mobile_to_use integer;
  remaining_quantity integer;
begin
  for item in select * from jsonb_array_elements(p_items)
  loop
    product_id_value := (item->>'product_id')::integer;
    quantity_value := (item->>'quantity')::integer;

    if quantity_value <= 0 then
      raise exception 'INVALID_STOCK_QUANTITY';
    end if;

    select coalesce(stock_mobile, 0), coalesce(stock_warehouse, 0)
      into mobile_stock, warehouse_stock
      from public.products
      where id = product_id_value
      for update;

    if not found or mobile_stock + warehouse_stock < quantity_value then
      raise exception 'INSUFFICIENT_STOCK';
    end if;

    mobile_to_use := least(mobile_stock, quantity_value);
    remaining_quantity := quantity_value - mobile_to_use;

    update public.products
      set stock_mobile = mobile_stock - mobile_to_use,
          stock_warehouse = warehouse_stock - remaining_quantity
      where id = product_id_value;
  end loop;
end;
$$;

revoke execute on function public.decrement_products_stock(jsonb) from public, anon, authenticated;
grant execute on function public.decrement_products_stock(jsonb) to service_role;