grant usage on schema public to service_role;
grant execute on function public.decrement_products_stock(jsonb, text) to service_role;

notify pgrst, 'reload schema';
